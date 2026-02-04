
import { getPrisma } from "../db/prisma";
import { redis } from "../modules/redis";

export interface LeaderboardEntry {
    rank: number;
    user: {
        name: string;
        avatar: string;
    };
    points: number;
    articles: number;
    reviews: number;
}

export interface LeaderboardResponse {
    leaderboard: LeaderboardEntry[];
    currentUser: LeaderboardEntry | null;
}

export class LeaderboardService {
    private static prisma = getPrisma();
    private static CACHE_KEY = "leaderboard:top20";
    private static CACHE_TTL = 60; // 60 seconds

    /**
     * Get Top Users
     * PRINCIPLES:
     * 1. Social Signal Only: This leaderboard reflects reputation, NOT governance power.
     * 2. Eventually Consistent: Scores update via worker (5-60 mins), not realtime.
     * 3. Read-Only Social Layer: Separated from core logic to allow "User" exploration.
     */
    public static async getTopUsers(currentUserId: number | null): Promise<LeaderboardResponse> {
        let leaderboard: LeaderboardEntry[] | null = null;

        // 1. Try Cache
        try {
            const cached = await redis.get(this.CACHE_KEY);
            if (cached) {
                leaderboard = JSON.parse(cached);
            }
        } catch (error) {
            console.warn("Redis Error (Cache Miss Fallback):", error);
        }

        // 2. Cache Miss: Query DB
        if (!leaderboard) {
            const topUsers = await this.prisma.user.findMany({
                where: {
                    role: "USER" // Only show normal users
                },
                orderBy: {
                    reputationScore: "desc",
                },
                take: 20, // Top 20
                include: {
                    profile: {
                        select: {
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
            });

            leaderboard = topUsers.map((user, index) => ({
                rank: index + 1,
                user: {
                    name: user.profile?.displayName || user.email?.split("@")[0] || "Unknown",
                    avatar: user.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.profile?.displayName || user.email?.split("@")[0] || "User")}&background=random`,
                },
                points: user.reputationScore,
                // Mock stats for now
                articles: Math.floor(user.reputationScore / 100),
                reviews: Math.floor(user.reputationScore / 50),
            }));

            // 3. Set Cache (Async, don't block response)
            try {
                await redis.set(this.CACHE_KEY, JSON.stringify(leaderboard), 'EX', this.CACHE_TTL);
            } catch (error) {
                console.warn("Redis Write Error:", error);
            }
        }

        let currentUserData: LeaderboardEntry | null = null;
        if (currentUserId) {
            // NOTE: We do NOT cache individual user lookups here as that would require per-user keys.
            // For now, we only cache the heavy specific top-20 aggregation.
            const currentUser = await this.prisma.user.findUnique({
                where: { id: currentUserId },
                include: { profile: true }
            });

            if (currentUser) {
                // Calculate Rank
                const rank = await this.prisma.user.count({
                    where: {
                        role: "USER",
                        reputationScore: { gt: currentUser.reputationScore }
                    }
                }) + 1;

                currentUserData = {
                    rank,
                    user: {
                        name: currentUser.profile?.displayName || currentUser.email?.split("@")[0] || "Unknown",
                        avatar: currentUser.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.profile?.displayName || currentUser.email?.split("@")[0] || "User")}&background=random`,
                    },
                    points: currentUser.reputationScore,
                    articles: Math.floor(currentUser.reputationScore / 100),
                    reviews: Math.floor(currentUser.reputationScore / 50),
                };
            }
        }

        return {
            leaderboard: leaderboard!,
            currentUser: currentUserData
        };
    }
}
