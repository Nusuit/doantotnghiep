
import { FeedIndexService } from "./feed-index.service";
import { PostStatsService } from "./post-stats.service";
import { PostProjectionService } from "../posts/post-projection.service";

export class FeedAssemblerService {
    static async getFeedForUser(userId: number, limit: number = 20, cursor?: string) {
        // 1. Get Index (List of IDs)
        const { items, nextCursor } = await FeedIndexService.getFeedIndex(userId, limit, cursor);
        const postIds = items.map(item => item.id);

        if (postIds.length === 0) {
            return { items: [], nextCursor: undefined };
        }

        // 2. Parallel Fetch: Projections + Stats (Batching)
        const [projectionsMap, statsMap] = await Promise.all([
            PostProjectionService.getProjections(postIds),
            PostStatsService.getStats(postIds)
        ]);

        // 3. Assemble
        const feed = postIds.map(id => {
            const projection = projectionsMap.get(id);
            if (!projection) return null; // Should ideally not happen if Index is consistent

            const stats = statsMap.get(id) || { likes: 0, comments: 0, shares: 0 };

            return {
                ...projection,
                // Flatten stats for UI convenience or keep nested?
                // PostCard expects flat: likes, comments, shares
                likes: stats.likes,
                comments: stats.comments,
                shares: stats.shares,
                // UI Specifics
                field: projection.tags[0] || projection.category?.name || "General" // Simple heuristics
            };
        }).filter(item => item !== null);

        return { items: feed, nextCursor };
    }
}
