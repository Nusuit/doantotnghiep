
export enum ArticleTier {
    TIER_0_PENDING = 'tier_0_pending',
    TIER_1_DISCOVERY = 'tier_1_discovery',
    TIER_2_GROWTH = 'tier_2_growth',
    TIER_3_VIRAL = 'tier_3_viral',
    ARCHIVED = 'archived'
}

export enum KVScore {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high'
}

export interface ArticleData {
    id: number;
    tier: ArticleTier;
    kvScore: KVScore;
    isEvergreen: boolean;
    saveRate?: number; // Calculated field or passed in
    suggestionCount: number;
    saveCount: number;
    upvoteCount: number;
    createdAt: Date;
}

export interface UserContext {
    userId: number;
    isFollower: boolean;
    hasContextMatch: boolean; // Location or RecentHistory match
}

export class ScoringEngine {
    /**
     * Calculates the Feed Score based on the Value Model v2 (Discovery * Freshness + KV Gate).
     * Refactored to prevent signal domination and ensure fairness.
     */
    static calculateFeedScore(article: ArticleData, userContext: UserContext): number {
        // 1. Discovery Score (Signal-based, Logarithmic)
        // Replaces simple linear summation to prevent "rich get richer".
        // Upvote(1) + Save(2) + Suggestion(5)
        const rawSignal = (article.upvoteCount * 1) +
            (article.saveCount * 2) +
            (article.suggestionCount * 5);

        // Base score depends on Tier to give initial visibility
        let tierBase = 10; // Tier 0
        if (article.tier === ArticleTier.TIER_1_DISCOVERY) tierBase = 20;
        else if (article.tier === ArticleTier.TIER_2_GROWTH) tierBase = 40;
        else if (article.tier === ArticleTier.TIER_3_VIRAL) tierBase = 80;

        // Logarithmic containment: log10 of signal prevents slight virality from dominating.
        // Multiplier 10 scales it to readable range (0-100+)
        const discoveryScore = tierBase + (Math.log10(1 + rawSignal) * 20);

        // 2. KV Gate (Value Verification)
        // KV acts as a limiter/gate, not a booster.
        let gatedScore = discoveryScore;

        if (article.kvScore === KVScore.LOW) {
            // Hard cap for unverified/low quality content
            // Even if viral, it cannot exceed minimal visibility buffer
            gatedScore = Math.min(discoveryScore, 60);
        } else if (article.kvScore === KVScore.MEDIUM) {
            // Soft cap, allows growth but requires High KV for true virality
            gatedScore = Math.min(discoveryScore, 120);
        }
        // KVScore.HIGH is uncapped.

        // 3. Boosts (Contextual)
        let boost = 1.0;
        // Personalization hooks (disabled by default in caller for Global Feed MVP)
        if (userContext.isFollower) boost *= 1.2;
        if (userContext.hasContextMatch) boost *= 1.3;

        // 4. Freshness (Gravity Decay)
        // Gravity increases with age. Evergreen content resists gravity.
        let gravity = 1.8;
        // Evergreen logic: confirmed value loves time.
        if (article.isEvergreen && article.kvScore === KVScore.HIGH) {
            gravity = 0.5;
        }

        const now = new Date();
        const ageMs = now.getTime() - new Date(article.createdAt).getTime();
        const ageHours = Math.max(0, ageMs / (1000 * 60 * 60));

        // Final Formula: (GatedScore * Boost) / (Age + 2)^Gravity
        const denominator = Math.pow(ageHours + 2, gravity);

        if (denominator === 0) return 0;

        return (gatedScore * boost) / denominator;
    }

    /**
     * Calculates the Knowledge Score (Reputation) update.
     * Formula: newKS = (currentKS * decayFactor) + log10(1 + newContributionPoints)
     * 
     * PRINCIPLES:
     * 1. Decay is crucial to prevent "Aristocracy" (Old users dominating forever).
     * 2. Growth is Logarithmic (Diminishing returns).
     */
    static calculateKnowledgeScore(currentKS: number, newContributionPoints: number, decayFactor: number = 0.995): number {
        // Logarithmic growth to prevent inflation.
        // Decay factor default 0.995 ensures gradual reduction if inactive.

        // log10(1 + points)
        const growth = Math.log10(1 + newContributionPoints);

        return (currentKS * decayFactor) + growth;
    }
}
