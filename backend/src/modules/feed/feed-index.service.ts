
import { getPrisma } from "../../db/prisma";

export interface FeedCursor {
    id: number;
    createdAt: string;
    rankingScore: number;
}

export interface FeedIndexResult {
    items: Array<{ id: number; createdAt: Date }>;
    nextCursor?: string;
}

function encodeCursor(cursor: FeedCursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}

function decodeCursor(raw?: string): FeedCursor | null {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
        if (
            !parsed ||
            typeof parsed.id !== "number" ||
            typeof parsed.createdAt !== "string" ||
            typeof parsed.rankingScore !== "number"
        ) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

export class FeedIndexService {
    /**
     * Get Feed Index (List of Article IDs)
     * Contract: Deterministic, Bounded, Ordered (Recency)
     * 
     * PRINCIPLES:
     * 1. Tie-breaker: Always use `id DESC` last for 100% determinism.
     * 2. NO LIVE STATS: Never use cache/live stats for sorting. Sort ONLY by persisted DB columns.
     *    Using live stats triggers order-jumping and breaks cursors.
     */
    static async getFeedIndex(
        userId: number,
        limit: number = 50,
        cursor?: string
    ): Promise<FeedIndexResult> {
        // FUTURE: Implement Recommendation Logic here
        // For now: Simple Recency Feed

        const prisma = getPrisma();

        const decoded = decodeCursor(cursor);
        const cursorDate = decoded ? new Date(decoded.createdAt) : null;

        const whereBase: any = {
            status: "PUBLISHED",
            tier: { in: ["TIER_0_PENDING", "TIER_1_DISCOVERY", "TIER_2_GROWTH", "TIER_3_VIRAL"] }
        };

        if (decoded && cursorDate && !Number.isNaN(cursorDate.getTime())) {
            whereBase.OR = [
                { rankingScore: { lt: decoded.rankingScore } },
                {
                    rankingScore: decoded.rankingScore,
                    createdAt: { lt: cursorDate }
                },
                {
                    rankingScore: decoded.rankingScore,
                    createdAt: cursorDate,
                    id: { lt: decoded.id }
                }
            ];
        }

        const articles = await prisma.article.findMany({
            where: whereBase,
            orderBy: [
                { rankingScore: "desc" },
                { createdAt: "desc" },
                { id: "desc" }
            ],
            take: limit + 1,
            select: {
                id: true,
                createdAt: true,
                rankingScore: true
            }
        });

        const hasMore = articles.length > limit;
        const items = hasMore ? articles.slice(0, limit) : articles;
        const last = items[items.length - 1];
        const nextCursor = hasMore && last
            ? encodeCursor({
                id: last.id,
                createdAt: last.createdAt.toISOString(),
                rankingScore: last.rankingScore || 0
            })
            : undefined;

        return { items, nextCursor };
    }
}
