import { PrismaClient, Badge, UserBadge } from '@prisma/client';

const prisma = new PrismaClient();

export class GamificationService {
    /**
     * Calculate vote power based on reputation
     * Formula: 1 + log(ReputationScore)
     * Ensure ReputationScore >= 1 to avoid log errors
     */
    calculateVotePower(reputationScore: number): number {
        const score = Math.max(1, reputationScore);
        // Using Math.log10 for a slower growth curve, or Math.log for natural log
        // Let's use Math.log10 as it's more standard for "orders of magnitude"
        // VotePower = 1 + log10(score)
        // Score 10 -> Power 2
        // Score 100 -> Power 3
        // Score 1000 -> Power 4
        return 1 + Math.log10(score);
    }

    /**
     * Award a badge to a user
     */
    async awardBadge(userId: number, badgeId: number): Promise<UserBadge> {
        // Check if already has badge
        const existing = await prisma.userBadge.findUnique({
            where: {
                userId_badgeId: {
                    userId,
                    badgeId
                }
            }
        });

        if (existing) return existing;

        return prisma.userBadge.create({
            data: {
                userId,
                badgeId
            }
        });
    }

    /**
     * Get user badges
     */
    async getUserBadges(userId: number) {
        return prisma.userBadge.findMany({
            where: { userId },
            include: {
                badge: true
            }
        });
    }

    /**
     * Get all available badges
     */
    async getAllBadges() {
        return prisma.badge.findMany();
    }
}
