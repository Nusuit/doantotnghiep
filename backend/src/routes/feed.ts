
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { FeedAssemblerService } from "../modules/feed/feed-assembler.service";
import { sendError, sendSuccess } from "../utils/response";

export const createFeedRouter = () => {
    const router = Router();

    router.get("/", authenticate, async (req, res, next) => {
        try {
            const userId = Number((req as any).user?.id);
            if (!userId) {
                return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");
            }

            const limit = req.query.limit ? Number(req.query.limit) : 20;
            const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;

            const feed = await FeedAssemblerService.getFeedForUser(userId, limit, cursor);

            return sendSuccess(req, res, feed);
        } catch (error) {
            next(error);
        }
    });

    return router;
};
