import { Router } from "express";
import { z } from "zod";
import { getPrisma } from "../db/prisma";
import jwt from "jsonwebtoken";
import { loadEnv } from "../config/env";
import { LeaderboardService } from "../services/leaderboard.service";
import { authenticate } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";
import { splitFullName } from "../utils/text";
import { redis } from "../modules/redis";

const updateProfileSchema = z.object({
    fullName: z.string().trim().min(1).max(100),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional().or(z.literal("")),
});

export function createUsersRouter() {
    const router = Router();

    // Get Leaderboard Data
    // TODO: Move to separate /leaderboard module later
    router.get("/leaderboard", async (req, res) => {
        try {
            let currentUserId: number | null = null;
            const authHeader = req.headers.authorization;
            const cookieToken = (req as any).cookies?.access_token;
            const token = (authHeader && authHeader.startsWith("Bearer "))
                ? authHeader.split(' ')[1]
                : cookieToken;

            if (token) {
                try {
                    const { JWT_SECRET: secret } = loadEnv(process.env);
                    const decoded: any = jwt.verify(token, secret);
                    currentUserId = decoded.id;
                } catch (e) {
                    // Ignore invalid token (treat as guest)
                }
            }

            const data = await LeaderboardService.getTopUsers(currentUserId);
            return sendSuccess(req, res, data);
        } catch (error) {
            console.error("Leaderboard error:", error);
            return sendError(req, res, 500, "ERR_INTERNAL", "Internal server error");
        }
    });

    // 1. Get Current User Profile (Private)
    router.get("/me", authenticate, async (req, res, next) => {
        try {
            const prisma = getPrisma();
            const userId = Number((req as any).user?.id);
            if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    accountStatus: true,
                    isEmailVerified: true,
                    createdAt: true,
                    updatedAt: true,
                    profile: true,
                },
            });

            if (!user) return sendError(req, res, 404, "ERR_NOT_FOUND", "User not found");

            return sendSuccess(req, res, { user });
        } catch (err) {
            next(err);
        }
    });

    // 2. Update Current User Profile (Private)
    router.put("/me/profile", authenticate, async (req, res, next) => {
        try {
            const parsed = updateProfileSchema.safeParse(req.body);
            if (!parsed.success) {
                return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
            }

            const prisma = getPrisma();
            const userId = Number((req as any).user?.id);
            if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

            const { firstName, lastName } = splitFullName(parsed.data.fullName);

            const updated = await prisma.userProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    displayName: parsed.data.fullName,
                    firstName,
                    lastName,
                    bio: parsed.data.bio,
                    avatarUrl: parsed.data.avatarUrl || null
                },
                update: {
                    displayName: parsed.data.fullName,
                    firstName,
                    lastName,
                    bio: parsed.data.bio,
                    ...(parsed.data.avatarUrl !== undefined ? { avatarUrl: parsed.data.avatarUrl || null } : {})
                },
            });

            // INVALIDATE CACHE
            try {
                await redis.del(`auth:me:${userId}`);
            } catch (e) {
                console.warn("Redis delete error:", e);
            }

            return sendSuccess(req, res, { profile: updated });
        } catch (err) {
            next(err);
        }
    });

    // 3. Get Public User Profile
    router.get("/:id", async (req, res, next) => {
        try {
            const userId = Number(req.params.id);
            if (!userId || isNaN(userId)) return sendError(req, res, 400, "ERR_VALIDATION", "Invalid user ID");

            const prisma = getPrisma();

            // Check if user exists first
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { profile: true }
            });

            if (!user) return sendError(req, res, 404, "ERR_NOT_FOUND", "User not found");

            // Return limited public data
            const publicProfile = {
                id: user.id,
                displayName: user.profile?.displayName || "User",
                avatarUrl: user.profile?.avatarUrl,
                bio: user.profile?.bio, // Assuming bio is public
                createdAt: user.createdAt,
                role: user.role // Maybe useful?
            };

            return sendSuccess(req, res, { user: publicProfile });
        } catch (err) {
            next(err);
        }
    });



    return router;
}

