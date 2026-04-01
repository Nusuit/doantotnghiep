
import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { FeedAssemblerService } from "../modules/feed/feed-assembler.service";
import { ArticleService } from "../modules/articles/article.service";
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

    router.post("/create", authenticate, async (req, res, next) => {
        try {
            const userId = Number((req as any).user?.id);
            if (!userId) {
                return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");
            }

            const { title, content, categoryId, locationContext, contextId, url } = req.body;

            if (!title || !content) {
                return sendError(req, res, 400, "ERR_INVALID_INPUT", "Title and content are required");
            }

            // Use provided categoryId or default to 1 (General)
            const finalCategoryId = categoryId || 1;

            const article = await ArticleService.createArticle({
                title,
                content,
                categoryId: finalCategoryId,
                authorId: userId,
                status: 'PUBLISHED',
                locationContext,
                contextId,
                url
            });

            return sendSuccess(req, res, {
                message: "Article created successfully",
                articleId: article.id
            });
        } catch (error) {
            console.error("Error creating article:", error);
            next(error);
        }
    });

    return router;
};
