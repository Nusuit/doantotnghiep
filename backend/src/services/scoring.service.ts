import { getPrisma } from "../db/prisma";
import { ScoringEngine, KVScore, ArticleTier } from "../domain/scoring.engine";
import { redis } from "../modules/redis";

const KV_HIGH_THRESHOLD = 0.6;
const KV_MEDIUM_THRESHOLD = 0.3;

function wilsonLowerBound(positive: number, total: number, z: number = 1.96): number {
    if (total === 0) return 0;
    const phat = positive / total;
    const z2 = z * z;
    const numerator = phat + z2 / (2 * total) - z * Math.sqrt((phat * (1 - phat) + z2 / (4 * total)) / total);
    const denominator = 1 + z2 / total;
    return numerator / denominator;
}

function mapKvScore(score: number): KVScore {
    if (score >= KV_HIGH_THRESHOLD) return KVScore.HIGH;
    if (score >= KV_MEDIUM_THRESHOLD) return KVScore.MEDIUM;
    return KVScore.LOW;
}

function computeKvScore(params: { viewCount: number; suggestionCount: number; saveCount: number; upvoteCount: number; }) {
    const positive = (params.suggestionCount * 3) + (params.saveCount * 2) + (params.upvoteCount * 1);
    const total = Math.max(params.viewCount || 0, positive);
    const score = wilsonLowerBound(positive, total);
    return { score, kvScore: mapKvScore(score) };
}

// TIER RULES CONFIG
// Easy to adjustment / A/B testing
// TIER CONFIG (As previously defined) ...
const TIER_CONFIG = {
    T0_TO_T1: { minViews: 10, minInteractions: 3 },
    T1_TO_T2: { minViews: 100, minSaveRate: 0.05, minSuggestions: 1 },
    T1_TO_ARCHIVE: { minViews: 200, maxEngagementRate: 0.01 },
    T2_TO_T3: { minViews: 500, minEngagementRate: 0.05 },
    T2_TO_ARCHIVE: { minViews: 500, maxEngagementRate: 0.01 },
};

interface ScoringArticle {
    id: number;
    tier: string;
    createdAt: Date;
    viewCount: number;
    saveCount: number;
    upvoteCount: number;
    _count?: {
        suggestions: number;
    };
}

interface ScoringUserUpdate {
    id: number;
    ksScore: number;
    reputationScore: number;
}

export class ScoringService {
    static async recalcArticleScores(batchSize: number = 200, articleId?: number) {
        const prisma: any = getPrisma();
        const articles = await prisma.article.findMany({
            where: {
                status: "PUBLISHED",
                ...(articleId ? { id: articleId } : {})
            },
            select: {
                id: true,
                tier: true,
                createdAt: true,
                viewCount: true,
                saveCount: true,
                upvoteCount: true,
                _count: {
                    select: {
                        suggestions: true,
                    }
                }
            }
        }) as unknown as ScoringArticle[];

        const updates = articles.map((article) => {
            const suggestionCount = article._count?.suggestions || 0;
            const { score, kvScore } = computeKvScore({
                viewCount: article.viewCount || 0,
                saveCount: article.saveCount || 0,
                suggestionCount,
                upvoteCount: article.upvoteCount || 0,
            });

            const saveRate = article.viewCount > 0 ? (article.saveCount / article.viewCount) : 0;
            const isEvergreen = saveRate > 0.1 && kvScore === KVScore.HIGH;

            const rankingScore = ScoringEngine.calculateFeedScore({
                id: article.id,
                tier: article.tier as ArticleTier,
                kvScore,
                isEvergreen,
                suggestionCount,
                saveCount: article.saveCount || 0,
                upvoteCount: article.upvoteCount || 0,
                createdAt: article.createdAt,
            }, {
                userId: 0,
                isFollower: false,
                hasContextMatch: false,
            });

            return { id: article.id, kvScore, isEvergreen, rankingScore };
        });

        for (let i = 0; i < updates.length; i += batchSize) {
            const slice = updates.slice(i, i + batchSize);
            await prisma.$transaction(slice.map((update: any) =>
                prisma.article.update({
                    where: { id: update.id },
                    data: {
                        kvScore: update.kvScore,
                        isEvergreen: update.isEvergreen,
                        rankingScore: update.rankingScore,
                    }
                })
            ));
        }

        return { updated: updates.length };
    }

    static async recalcTierPool(batchSize: number = 200) {
        const prisma: any = getPrisma();
        const articles = await prisma.article.findMany({
            where: {
                status: "PUBLISHED",
                tier: { in: ["TIER_0", "TIER_1", "TIER_2"] }
            },
            select: {
                id: true,
                tier: true,
                viewCount: true,
                saveCount: true,
                upvoteCount: true,
                _count: {
                    select: {
                        suggestions: true,
                    }
                }
            }
        }) as unknown as ScoringArticle[];

        const updates: Array<{ id: number; tier: ArticleTier }> = [];

        for (const article of articles) {
            const viewCount = article.viewCount || 0;
            const saveCount = article.saveCount || 0;
            const suggestionCount = article._count?.suggestions || 0;
            const upvoteCount = article.upvoteCount || 0;
            const saveRate = viewCount > 0 ? saveCount / viewCount : 0;
            const engagementRate = viewCount > 0 ? (saveCount + suggestionCount + upvoteCount) / viewCount : 0;

            let nextTier: ArticleTier | null = null;
            const interactions = saveCount + suggestionCount + upvoteCount;

            // Tier Logic using Config
            if (article.tier === "TIER_0") {
                if (viewCount >= TIER_CONFIG.T0_TO_T1.minViews || interactions >= TIER_CONFIG.T0_TO_T1.minInteractions) {
                    nextTier = ArticleTier.TIER_1;
                }
            }

            if (article.tier === "TIER_1") {
                if (viewCount > TIER_CONFIG.T1_TO_T2.minViews && (saveRate > TIER_CONFIG.T1_TO_T2.minSaveRate || suggestionCount >= TIER_CONFIG.T1_TO_T2.minSuggestions)) {
                    nextTier = ArticleTier.TIER_2;
                }
            }

            if (article.tier === "TIER_2") {
                if (viewCount > TIER_CONFIG.T2_TO_T3.minViews && engagementRate > TIER_CONFIG.T2_TO_T3.minEngagementRate) {
                    nextTier = ArticleTier.TIER_3;
                }
            }

            if (nextTier && nextTier !== article.tier) {
                updates.push({ id: article.id, tier: nextTier });
            }
        }

        for (let i = 0; i < updates.length; i += batchSize) {
            const slice = updates.slice(i, i + batchSize);
            await prisma.$transaction(slice.map((update: any) =>
                prisma.article.update({
                    where: { id: update.id },
                    data: { tier: update.tier }
                })
            ));
        }

        return { updated: updates.length };
    }

    static async recalcUserScores(batchSize: number = 200, userId?: number) {
        const prisma: any = getPrisma();

        // MVP Optimization: Only update users who HAVE content or are queried.
        const contributions = await prisma.article.findMany({
            where: {
                status: "PUBLISHED",
                ...(userId ? { authorId: userId } : {})
            },
            select: {
                authorId: true,
                saveCount: true,
                upvoteCount: true,
                _count: {
                    select: {
                        suggestions: true,
                    }
                }
            }
        });

        const authorIds = Array.from(new Set(contributions.map((c: any) => c.authorId)));
        if (authorIds.length === 0) {
            return { updated: 0 };
        }

        const contributionMap = new Map<number, { suggestionCount: number; saveCount: number; upvoteCount: number }>();
        contributions.forEach((entry: any) => {
            const current = contributionMap.get(entry.authorId) || { suggestionCount: 0, saveCount: 0, upvoteCount: 0 };
            current.suggestionCount += entry._count?.suggestions || 0;
            current.saveCount += entry.saveCount || 0;
            current.upvoteCount += entry.upvoteCount || 0;
            contributionMap.set(entry.authorId, current);
        });

        const updates: ScoringUserUpdate[] = Array.from(contributionMap.entries()).map(([authorId, entry]) => {
            const suggestionCount = entry.suggestionCount || 0;
            const saveCount = entry.saveCount || 0;
            const upvoteCount = entry.upvoteCount || 0;
            const contributionPoints = (suggestionCount * 10) + (saveCount * 5) + (upvoteCount * 1);
            const ksScore = ScoringEngine.calculateKnowledgeScore(0, contributionPoints);
            const reputationScore = Math.round(ksScore * 100);

            return { id: authorId, ksScore, reputationScore };
        });

        for (let i = 0; i < updates.length; i += batchSize) {
            const slice = updates.slice(i, i + batchSize);
            await prisma.$transaction(slice.map((update: any) =>
                prisma.user.update({
                    where: { id: update.id },
                    data: { ksScore: update.ksScore, reputationScore: update.reputationScore }
                })
            ));
        }

        try {
            await redis.del("leaderboard:top20");
        } catch (error) {
            console.warn("Failed to clear leaderboard cache", error);
        }

        return { updated: updates.length };
    }
}
