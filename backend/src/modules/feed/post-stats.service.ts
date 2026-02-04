
import { getPrisma } from "../../db/prisma";
import { redis } from "../redis";

export interface PostStats {
    likes: number;
    comments: number;
    shares: number; // Placeholder
}

const STATS_CACHE_PREFIX = "post_stats:";
const STATS_TTL = 30; // 30 seconds (Short Lived)

export class PostStatsService {
    static async getStats(ids: number[]): Promise<Map<number, PostStats>> {
        if (ids.length === 0) return new Map();

        const uniqueIds = Array.from(new Set(ids));
        const keys = uniqueIds.map(id => `${STATS_CACHE_PREFIX}${id}`);
        const resultMap = new Map<number, PostStats>();

        // 1. Try Cache
        let cachedValues: (string | null)[] = [];
        try {
            cachedValues = await redis.mget(keys);
        } catch (error) {
            console.error("[PostStats] Redis Error:", error);
            cachedValues = new Array(uniqueIds.length).fill(null);
        }

        const missingIds: number[] = [];

        uniqueIds.forEach((id, index) => {
            const cached = cachedValues[index];
            if (cached) {
                try {
                    resultMap.set(id, JSON.parse(cached));
                } catch (e) {
                    missingIds.push(id);
                }
            } else {
                missingIds.push(id);
            }
        });

        // 2. Fetch Missing from DB
        if (missingIds.length > 0) {
            // NOTE: This might be expensive loop if many missing.
            // Ideally we do an aggregation query.
            // For now, let's do Promise.all with individual aggregations (Prisma doesn't support easy multi-id count in one go for diverse relations without custom raw query or groupBy trickery)
            // GroupBy is better.

            const stats = await this.fetchStatsFromDb(missingIds);

            // 3. Cache
            const pipeline = redis.pipeline();
            stats.forEach((stat, id) => {
                resultMap.set(id, stat);
                pipeline.setex(`${STATS_CACHE_PREFIX}${id}`, STATS_TTL, JSON.stringify(stat));
            });
            await pipeline.exec();
        }

        return resultMap;
    }

    private static async fetchStatsFromDb(ids: number[]): Promise<Map<number, PostStats>> {
        const prisma = getPrisma();
        const statsMap = new Map<number, PostStats>();

        const articles = await prisma.article.findMany({
            where: { id: { in: ids } },
            select: {
                id: true,
                upvoteCount: true,
                suggestionCount: true,
                saveCount: true
            }
        });

        articles.forEach((article) => {
            statsMap.set(article.id, {
                likes: article.upvoteCount || 0,
                comments: article.suggestionCount || 0,
                shares: article.saveCount || 0
            });
        });

        return statsMap;
    }
}
