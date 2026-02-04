
import { getPrisma } from "../../db/prisma";
import { redis } from "../redis";

export interface PostProjection {
    id: number;
    title: string;
    excerpt: string;
    author: {
        name: string;
        avatar: string;
    };
    tags: string[];
    category: {
        name: string;
        slug: string;
    } | null;
    location: {
        name: string;
        lat: number;
        lng: number;
    } | null;
    createdAt: string; // ISO String
}

const CACHE_PREFIX = "post_projection:";
const CACHE_TTL = 3600; // 1 hour

export class PostProjectionService {
    /**
     * Fetch Post Projections by IDs using Cache-Aside (Batch)
     */
    static async getProjections(ids: number[]): Promise<Map<number, PostProjection>> {
        if (ids.length === 0) return new Map();

        const uniqueIds = Array.from(new Set(ids));
        const keys = uniqueIds.map(id => `${CACHE_PREFIX}${id}`);
        const resultMap = new Map<number, PostProjection>();

        // 1. Try Cache (Multi-Get)
        let cachedValues: (string | null)[] = [];
        try {
            cachedValues = await redis.mget(keys);
        } catch (error) {
            console.error("[PostProjection] Redis Error:", error);
            // Fallback: treat all as miss
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
            const dbPosts = await this.fetchFromDb(missingIds);

            // 3. Populate Map & Cache
            const pipeline = redis.pipeline();

            dbPosts.forEach(post => {
                const projection = this.transform(post);
                resultMap.set(post.id, projection);
                pipeline.setex(`${CACHE_PREFIX}${post.id}`, CACHE_TTL, JSON.stringify(projection));
            });

            try {
                await pipeline.exec();
            } catch (error) {
                console.error("[PostProjection] Redis Pipeline Error:", error);
            }
        }

        return resultMap;
    }

    // --- Private Helpers ---

    private static async fetchFromDb(ids: number[]) {
        const prisma = getPrisma();
        return prisma.article.findMany({
            where: { id: { in: ids } },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
                author: {
                    select: {
                        profile: {
                            select: {
                                displayName: true,
                                avatarUrl: true
                            }
                        },
                        email: true // Fallback if no profile
                    }
                },
                tags: {
                    select: {
                        name: true
                    }
                },
                category: {
                    select: {
                        name: true,
                        slug: true
                    }
                },
                // Context for Location
                contexts: {
                    where: { context: { type: 'PLACE' } },
                    select: {
                        context: {
                            select: {
                                name: true,
                                latitude: true,
                                longitude: true
                            }
                        }
                    },
                    take: 1
                }
            }
        });
    }

    private static transform(post: any): PostProjection {
        // Author extraction
        const authorName = post.author?.profile?.displayName || post.author?.email?.split('@')[0] || "Unknown";
        const authorAvatar = post.author?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}`;

        // Excerpt logic
        const excerpt = post.content
            ? (post.content.length > 150 ? post.content.substring(0, 150) + "..." : post.content)
            : "";

        // Tag extraction
        const tags = Array.isArray(post.tags) ? post.tags.map((t: any) => t.name).filter(Boolean) : [];

        // Location extraction
        const context = post.contexts?.[0]?.context;
        const location = context && typeof context.latitude === "number" && typeof context.longitude === "number"
            ? { name: context.name, lat: context.latitude, lng: context.longitude }
            : null;

        return {
            id: post.id,
            title: post.title,
            excerpt,
            author: {
                name: authorName,
                avatar: authorAvatar
            },
            tags,
            category: post.category ? { name: post.category.name, slug: post.category.slug } : null,
            location,
            createdAt: post.createdAt.toISOString()
        };
    }
}
