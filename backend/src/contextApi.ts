import { Router } from "express";
import { z } from "zod";

import { getPrisma } from "./db/prisma";
import { authenticate, requireActiveUser, requireCsrf } from "./middleware/auth";
import { enqueueScoringJobs } from "./modules/queue";
import { sendError, sendSuccess } from "./utils/response";

function slugify(input: string) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeCategorySlug(input: string) {
  return String(input)
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function toCategoryName(input: string) {
  const cleaned = String(input).trim();
  if (!cleaned) return "Uncategorized";
  return cleaned
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 100);
}

const ContextTypeEnum = z.enum(["PLACE", "ENTITY", "TOPIC"]);

const createArticleBodySchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  contexts: z
    .array(
      z.object({
        type: ContextTypeEnum,
        name: z.string().min(1),
        description: z.string().optional(),
        category: z.string().optional(),
        address: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      })
    )
    .min(1)
    .max(1),
});

const interactionSchema = z.object({
  type: z.enum(["VIEW", "SHARE", "SAVE", "UPVOTE", "DOWNVOTE", "REPORT"]),
  timeSpentMs: z.number().int().min(0).max(60 * 60 * 1000).optional(),
  scrollDepthPercent: z.number().int().min(0).max(100).optional(),
  locationLat: z.number().optional(),
  locationLong: z.number().optional(),
});

const batchInteractionSchema = z.object({
  interactions: z
    .array(
      z.object({
        articleId: z.number().int().positive(),
        type: z.enum(["VIEW", "SHARE", "SAVE", "UPVOTE", "DOWNVOTE", "REPORT"]),
        timeSpentMs: z.number().int().min(0).max(60 * 60 * 1000).optional(),
        scrollDepthPercent: z.number().int().min(0).max(100).optional(),
      })
    )
    .min(1)
    .max(50),
});

const suggestionSchema = z.object({
  content: z.string().min(1),
  comment: z.string().optional(),
});

const bboxQuerySchema = z.object({
  minLat: z.coerce.number().optional(),
  minLng: z.coerce.number().optional(),
  maxLat: z.coerce.number().optional(),
  maxLng: z.coerce.number().optional(),
  category: z.string().optional(),
  categories: z.string().optional(),
  reviewStatus: z.enum(["all", "reviewed", "unreviewed"]).optional().default("all"),
  minStars: z.coerce.number().min(1).max(5).optional(),
  limit: z.coerce.number().int().min(1).max(500).optional().default(200),
});

const upsertContextReviewSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

const contextReviewListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.enum(["newest", "highest", "lowest"]).optional().default("newest"),
});

async function recalculateContextReviewStats(prisma: any, contextId: number) {
  // We use Article with type = 'REVIEW' linked to this context
  const aggregate = await prisma.article.aggregate({
    _count: { _all: true },
    where: { contextId, type: "REVIEW", status: "PUBLISHED" },
  });

  // Calculate average rating from a custom field or interaction? 
  // Wait, the new schema doesn't have a "stars" field on Article or Interaction.
  // The plan said: "Delete the context_reviews table and the stars field. Add a type enum to Article (e.g., POST, REVIEW)."
  // So there are no stars anymore. We just count reviews.
  const reviewCount = aggregate?._count?._all || 0;
  const avgRating = 0.0; // Stars are removed

  await prisma.context.update({
    where: { id: contextId },
    data: {
      reviewCount,
      avgRating,
      isReviewed: reviewCount > 0,
    },
  });
}

export function createContextApiRouter() {
  const router = Router();

  // POST /api/articles
  router.post("/articles", authenticate, requireActiveUser, requireCsrf, async (req, res, next) => {
    try {
      const parsed = createArticleBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const prisma: any = getPrisma();
      const authorId = Number((req as any).user?.id);
      if (!authorId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

      const categorySlug = normalizeCategorySlug(parsed.data.category);
      let category = await prisma.taxonomy.findUnique({ where: { slug: categorySlug } });
      if (!category) {
        try {
          category = await prisma.taxonomy.create({
            data: {
              type: "CATEGORY",
              slug: categorySlug,
              name: toCategoryName(parsed.data.category),
              description: null,
            },
          });
        } catch (_err) {
          category = await prisma.taxonomy.findUnique({ where: { slug: categorySlug } });
        }
      }

      if (!category) {
        return sendError(req, res, 400, "ERR_UNKNOWN_CATEGORY", "Unknown category");
      }

      // Category constraints (doc-level, MVP)
      const hasPlace = parsed.data.contexts.some((c) => c.type === "PLACE");
      const hasEntity = parsed.data.contexts.some((c) => c.type === "ENTITY");
      const hasTopic = parsed.data.contexts.some((c) => c.type === "TOPIC");

      if (categorySlug === "PLACE_BASED_KNOWLEDGE" && !hasPlace) {
        return sendError(
          req,
          res,
          400,
          "ERR_CATEGORY_CONTEXT_MISMATCH",
          "PLACE_BASED_KNOWLEDGE requires at least one PLACE context"
        );
      }
      if (categorySlug === "BOOK_FILM" && !hasEntity) {
        return sendError(
          req,
          res,
          400,
          "ERR_CATEGORY_CONTEXT_MISMATCH",
          "BOOK_FILM requires at least one ENTITY context"
        );
      }
      if (categorySlug === "ABSTRACT_TOPIC" && !hasTopic) {
        return sendError(
          req,
          res,
          400,
          "ERR_CATEGORY_CONTEXT_MISMATCH",
          "ABSTRACT_TOPIC requires at least one TOPIC context"
        );
      }

      // Validate PLACE fields
      for (const c of parsed.data.contexts) {
        if (c.type === "PLACE") {
          if (typeof c.latitude !== "number" || typeof c.longitude !== "number") {
            return sendError(
              req,
              res,
              400,
              "ERR_VALIDATION",
              "PLACE context requires latitude and longitude"
            );
          }
        }
      }

      // Create contexts implicitly
      // PRINCIPLE: Contexts are ONLY created via Article/Suggestion flow.
      // There is no standalone "POST /contexts" to prevent "Context Explosion" and spam.
      const contextRecords = [] as any[];
      for (const c of parsed.data.contexts) {
        let existing;
        if (c.type === "PLACE") {
          // PLACE identity is exact coordinates. Name/address may evolve, coordinates stay canonical.
          existing = await prisma.context.findFirst({
            where: {
              type: c.type,
              latitude: c.latitude,
              longitude: c.longitude,
            },
          });
        } else {
          existing = await prisma.context.findFirst({
            where: { type: c.type, name: c.name.trim() },
          });
        }

        const ctx =
          existing ||
          (await prisma.context.create({
            data: {
              type: c.type,
              name: c.name.trim(),
              description: c.description?.trim() || null,
              category: c.category?.trim() || null,
              address: c.address?.trim() || null,
              latitude: c.type === "PLACE" ? c.latitude : null,
              longitude: c.type === "PLACE" ? c.longitude : null,
            },
          }));

        contextRecords.push(ctx);
      }

      // Create unique-ish slug
      const base = slugify(parsed.data.title) || "article";
      let slug = base;
      const exists = await prisma.article.findUnique({ where: { slug } });
      if (exists) slug = `${base}-${Date.now().toString(36)}`;

      const mainContextId = contextRecords.length > 0 ? contextRecords[0].id : null;
      if (!mainContextId) {
        return sendError(req, res, 400, "ERR_VALIDATION", "At least one context is required to create an article.");
      }

      const article = await prisma.article.create({
        data: {
          slug,
          title: parsed.data.title.trim(),
          content: parsed.data.content,
          authorId,
          type: "POST",
          contextId: mainContextId,
          taxonomies: { create: [{ taxonomyId: category.id }] },
        },
        include: {
          taxonomies: { include: { taxonomy: true } },
          context: true,
        },
      });

      return sendSuccess(req, res, article, 201);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/articles/:id/visibility
  router.put("/articles/:id/visibility", authenticate, async (req, res, next) => {
    try {
      const prisma: any = getPrisma();
      const id = Number(req.params.id);
      const userId = Number((req as any).user?.id);

      if (!id || !userId) return sendError(req, res, 400, "ERR_VALIDATION", "Invalid input");

      const article = await prisma.article.findUnique({ where: { id } });
      if (!article) return sendError(req, res, 404, "ERR_NOT_FOUND", "Article not found");
      if (article.authorId !== userId) return sendError(req, res, 403, "ERR_FORBIDDEN", "Not your article");

      const newVisibility = article.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC";
      
      const updated = await prisma.article.update({
        where: { id },
        data: { visibility: newVisibility }
      });
      return sendSuccess(req, res, updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/articles/:id
  router.delete("/articles/:id", authenticate, async (req, res, next) => {
    try {
      const prisma: any = getPrisma();
      const id = Number(req.params.id);
      const userId = Number((req as any).user?.id);

      if (!id || !userId) return sendError(req, res, 400, "ERR_VALIDATION", "Invalid input");

      const article = await prisma.article.findUnique({ where: { id } });
      if (!article) return sendError(req, res, 404, "ERR_NOT_FOUND", "Article not found");
      if (article.authorId !== userId) return sendError(req, res, 403, "ERR_FORBIDDEN", "Not your article");

      await prisma.article.delete({ where: { id } });
      return sendSuccess(req, res, { deleted: true });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/articles/:id
  router.get("/articles/:id", async (req, res, next) => {
    try {
      const prisma: any = getPrisma();
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid id");
      }

      const article = await prisma.article.findUnique({
        where: { id },
        include: {
          taxonomies: { include: { taxonomy: true } },
          context: true,
          author: { select: { id: true, email: true } },
        },
      });

      if (!article) return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");
      return sendSuccess(req, res, article);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/articles/:id/interactions
  router.post("/articles/:id/interactions", authenticate, requireActiveUser, requireCsrf, async (req, res, next) => {
    try {
      const parsed = interactionSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const prisma: any = getPrisma();
      const articleId = Number(req.params.id);
      if (!Number.isFinite(articleId) || articleId <= 0) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid id");
      }

      const userId = Number((req as any).user?.id);
      if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { id: true, authorId: true }
      });

      if (!article) return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");

      const { type, timeSpentMs, scrollDepthPercent, locationLat, locationLong } = parsed.data;

      // Anti-spam / Rate-limit for VIEW
      if (type === "VIEW") {
        const viewWindowMs = 30 * 60 * 1000;
        const windowStart = new Date(Date.now() - viewWindowMs);
        const recentView = await prisma.interaction.findFirst({
          where: {
            userId,
            articleId,
            type: "VIEW",
            createdAt: { gt: windowStart }
          }
        });
        if (recentView) {
          // Silent success for spammy views
          return sendSuccess(req, res, { recorded: false, reason: "rate_limit" });
        }
      }

      if (type === "UPVOTE") {
        const existingVote = await prisma.interaction.findFirst({
          where: { userId, articleId, type: "UPVOTE" }
        });

        if (!existingVote) {
          await prisma.$transaction([
            prisma.interaction.create({
              data: {
                userId,
                articleId,
                type: "UPVOTE",
                timeSpentMs,
                scrollDepthPercent,
                locationLat,
                locationLong
              }
            }),
            prisma.article.update({
              where: { id: articleId },
              data: { upvoteCount: { increment: 1 } }
            })
          ]);
          await enqueueScoringJobs({ articleId, userId: article.authorId });
          return sendSuccess(req, res, { upvoted: true });
        } else {
          await prisma.$transaction([
            prisma.interaction.delete({
              where: { id: existingVote.id }
            }),
            prisma.article.update({
              where: { id: articleId },
              data: { upvoteCount: { decrement: 1 } }
            })
          ]);
          await enqueueScoringJobs({ articleId, userId: article.authorId });
          return sendSuccess(req, res, { upvoted: false });
        }
      }

      if (type === "SAVE" || type === "DOWNVOTE" || type === "REPORT" || type === "SHARE") {
        const existingInteraction = await prisma.interaction.findFirst({
          where: { userId, articleId, type }
        });
        if (!existingInteraction) {
          const txOps: any[] = [
            prisma.interaction.create({
              data: {
                userId,
                articleId,
                type,
                timeSpentMs,
                scrollDepthPercent,
                locationLat,
                locationLong
              }
            })
          ];
          if (type === "SAVE") {
            txOps.push(
              prisma.article.update({
                where: { id: articleId },
                data: { saveCount: { increment: 1 } }
              })
            );
          }
          await prisma.$transaction(txOps);
        }
        return sendSuccess(req, res, { recorded: true });
      }

      const incrementData: any = {};
      if (type === "VIEW") incrementData.viewCount = { increment: 1 };

      await prisma.$transaction([
        prisma.interaction.create({
          data: {
            userId,
            articleId,
            type,
            timeSpentMs,
            scrollDepthPercent,
            locationLat,
            locationLong
          }
        }),
        // PRINCIPLE: Only update stats counters here.
        // NEVER update rankingScore directly. Let the worker handle it async.
        prisma.article.update({
          where: { id: articleId },
          data: incrementData
        })
      ]);

      await enqueueScoringJobs({ articleId, userId: article.authorId });
      return sendSuccess(req, res, { recorded: true });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/interactions/batch
  router.post("/interactions/batch", authenticate, requireActiveUser, requireCsrf, async (req, res, next) => {
    try {
      const parsed = batchInteractionSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const prisma: any = getPrisma();
      const userId = Number((req as any).user?.id);
      if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

      const items = parsed.data.interactions;
      const articleIds = Array.from(new Set(items.map((i) => i.articleId)));

      const articles = await prisma.article.findMany({
        where: { id: { in: articleIds } },
        select: { id: true, authorId: true }
      });

      if (articles.length !== articleIds.length) {
        return sendError(req, res, 404, "ERR_NOT_FOUND", "Some articles not found");
      }

      const articleMap = new Map<number, any>(articles.map((a: any) => [a.id, a]));

      const existingVotes = await prisma.interaction.findMany({
        where: { userId, articleId: { in: articleIds }, type: { in: ["SAVE", "UPVOTE", "DOWNVOTE", "REPORT", "SHARE"] } },
        select: { articleId: true, type: true }
      });

      const existingInteractionSet = new Set(existingVotes.map((v: any) => `${v.articleId}:${v.type}`));

      // Rate Limit for VIEWs in Batch
      // 1. Get recent views (last 30 mins) - Strengthened integrity
      const viewWindowMs = 30 * 60 * 1000;
      const windowStart = new Date(Date.now() - viewWindowMs);
      const recentViews = await prisma.interaction.findMany({
        where: {
          userId,
          type: "VIEW",
          createdAt: { gt: windowStart }
        },
        select: { articleId: true }
      });
      const recentViewedArticleIds = new Set(recentViews.map((v: any) => v.articleId));

      await prisma.$transaction(async (tx: any) => {
        for (const item of items) {
          const article = articleMap.get(item.articleId);
          if (!article) continue;

          // Rate Limit Check
          if (item.type === "VIEW" && recentViewedArticleIds.has(item.articleId)) {
            continue; // Skip counting this view
          }

          if (item.type === "UPVOTE") {
            if (existingInteractionSet.has(`${item.articleId}:UPVOTE`)) continue;
            existingInteractionSet.add(`${item.articleId}:UPVOTE`);
            await tx.interaction.create({
              data: {
                userId,
                articleId: item.articleId,
                type: item.type,
                timeSpentMs: item.timeSpentMs,
                scrollDepthPercent: item.scrollDepthPercent
              }
            });
            await tx.article.update({
              where: { id: item.articleId },
              data: { upvoteCount: { increment: 1 } }
            });
            continue;
          }

          if (item.type === "SAVE" || item.type === "DOWNVOTE" || item.type === "REPORT" || item.type === "SHARE") {
            const dedupeKey = `${item.articleId}:${item.type}`;
            if (existingInteractionSet.has(dedupeKey)) continue;
            existingInteractionSet.add(dedupeKey);

            await tx.interaction.create({
              data: {
                userId,
                articleId: item.articleId,
                type: item.type,
                timeSpentMs: item.timeSpentMs,
                scrollDepthPercent: item.scrollDepthPercent
              }
            });
            if (item.type === "SAVE") {
              await tx.article.update({
                where: { id: item.articleId },
                data: { saveCount: { increment: 1 } }
              });
            }
            continue;
          }

          const incrementData: any = {};
          if (item.type === "VIEW") {
            incrementData.viewCount = { increment: 1 };
            // Mark as viewed in our local set to prevent double counting within the same batch
            recentViewedArticleIds.add(item.articleId);
          }

          await tx.interaction.create({
            data: {
              userId,
              articleId: item.articleId,
              type: item.type,
              timeSpentMs: item.timeSpentMs,
              scrollDepthPercent: item.scrollDepthPercent
            }
          });
          await tx.article.update({
            where: { id: item.articleId },
            data: incrementData
          });
        }
      });

      const authorIds = new Set<number>();
      articleIds.forEach((id) => {
        const article = articleMap.get(id);
        if (article?.authorId) authorIds.add(article.authorId);
      });

      for (const id of articleIds) {
        await enqueueScoringJobs({ articleId: id });
      }

      for (const authorId of authorIds) {
        await enqueueScoringJobs({ userId: authorId });
      }

      return sendSuccess(req, res, { recorded: items.length });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/articles/:id/suggestions
  router.post("/articles/:id/suggestions", authenticate, requireActiveUser, requireCsrf, async (req, res, next) => {
    try {
      const parsed = suggestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const prisma: any = getPrisma();
      const articleId = Number(req.params.id);
      if (!Number.isFinite(articleId) || articleId <= 0) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid id");
      }

      const userId = Number((req as any).user?.id);
      if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

      // Check spam: 1 user / article / 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const existingSuggestion = await prisma.suggestion.findFirst({
        where: {
          authorId: userId,
          articleId,
          createdAt: { gt: yesterday }
        }
      });

      if (existingSuggestion) {
        return sendError(req, res, 429, "ERR_RATE_LIMIT", "You can only submit one suggestion per article every 24 hours.");
      }

      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: { id: true, authorId: true }
      });

      if (!article) return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");

      // Refactor: Decoupled Suggestion from Interaction
      const suggestion = await prisma.suggestion.create({
        data: {
          authorId: userId,
          articleId,
          content: parsed.data.content,
          comment: parsed.data.comment || null,
        }
      });

      await enqueueScoringJobs({ articleId, userId: article.authorId });
      return sendSuccess(req, res, { suggestion }, 201);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/contexts/:id
  router.get("/contexts/:id", async (req, res, next) => {
    try {
      const prisma: any = getPrisma();
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid id");
      }

      const context = await prisma.context.findUnique({
        where: { id },
        include: {
          articles: {
            include: {
              taxonomies: {
                include: { taxonomy: true },
              },
            },
          },
        },
      });

      if (!context) return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");
      return sendSuccess(req, res, context);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/map/contexts (PLACE only)
  router.get("/map/contexts", async (req, res, next) => {
    try {
      const parsed = bboxQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid query params", parsed.error.issues);
      }

      const { minLat, minLng, maxLat, maxLng, category, categories, reviewStatus, minStars, limit } = parsed.data;
      const prisma: any = getPrisma();

      const where: any = { type: "PLACE" };
      if (
        minLat !== undefined &&
        minLng !== undefined &&
        maxLat !== undefined &&
        maxLng !== undefined
      ) {
        where.latitude = { gte: minLat, lte: maxLat };
        where.longitude = { gte: minLng, lte: maxLng };
      }

      const categoryFilters = [
        ...(category ? [category] : []),
        ...(categories ? categories.split(",").map((item) => item.trim()).filter(Boolean) : []),
      ];
      if (categoryFilters.length > 0) {
        where.category = { in: Array.from(new Set(categoryFilters)) };
      }

      if (reviewStatus === "reviewed") {
        where.isReviewed = true;
      } else if (reviewStatus === "unreviewed") {
        where.isReviewed = false;
      }

      if (minStars !== undefined) {
        where.avgRating = { gte: minStars };
      }

      const contexts = await prisma.context.findMany({
        where,
        take: limit,
        orderBy: [
          { isReviewed: "desc" },
          { avgRating: "desc" },
          { updatedAt: "desc" },
        ],
      });

      return sendSuccess(req, res, { contexts });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/map/contexts/:id/reviews
  router.post(
    "/map/contexts/:id/reviews",
    authenticate,
    requireActiveUser,
    requireCsrf,
    async (req, res, next) => {
      try {
        const prisma: any = getPrisma();
        const contextId = Number(req.params.id);
        if (!Number.isFinite(contextId) || contextId <= 0) {
          return sendError(req, res, 400, "ERR_VALIDATION", "Invalid id");
        }

        const parsed = upsertContextReviewSchema.safeParse(req.body);
        if (!parsed.success) {
          return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
        }

        const userId = Number((req as any).user?.id);
        if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

        const context = await prisma.context.findUnique({ where: { id: contextId } });
        if (!context) return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");
        if (context.type !== "PLACE") {
          return sendError(req, res, 400, "ERR_VALIDATION", "Context is not PLACE");
        }

        // Reviews are now Articles of type REVIEW
        // As per the plan, 'stars' field is removed. We use content to store review text.
        // The composite unique constraint contextId_userId is gone because it's now just Articles.
        // We handle upsert manually.
        let review = await prisma.article.findFirst({
          where: {
            contextId,
            type: "REVIEW"
          }
        });

        if (review) {
          if (review.authorId !== userId) {
            return sendError(req, res, 409, "ERR_REVIEW_EXISTS", "This PLACE already has a canonical review article.");
          }
          review = await prisma.article.update({
            where: { id: review.id },
            data: {
              content: parsed.data.comment || "Reviewed",
              title: `Review for Context ${contextId}`, // Generate a title
              status: "PUBLISHED"
            }
          });
        } else {
          review = await prisma.article.create({
            data: {
              contextId,
              authorId: userId,
              type: "REVIEW",
              slug: `review-${contextId}-${userId}-${Date.now()}`,
              content: parsed.data.comment || "Reviewed",
              title: `Review for Context ${contextId}`,
              status: "PUBLISHED"
            }
          });
        }

        await recalculateContextReviewStats(prisma, contextId);

        return sendSuccess(req, res, { review }, 201);
      } catch (err) {
        next(err);
      }
    }
  );

  // GET /api/map/contexts/:id/reviews
  router.get("/map/contexts/:id/reviews", async (req, res, next) => {
    try {
      const prisma: any = getPrisma();
      const contextId = Number(req.params.id);
      if (!Number.isFinite(contextId) || contextId <= 0) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid id");
      }

      const queryParsed = contextReviewListQuerySchema.safeParse(req.query);
      if (!queryParsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid query params", queryParsed.error.issues);
      }

      const context = await prisma.context.findUnique({ where: { id: contextId } });
      if (!context) return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");
      if (context.type !== "PLACE") {
        return sendError(req, res, 400, "ERR_VALIDATION", "Context is not PLACE");
      }

      const { page, limit, sort } = queryParsed.data;
      const skip = (page - 1) * limit;
      const asc = "asc" as const;
      const desc = "desc" as const;
      const orderBy = [{ createdAt: desc }];

      const [totalItems, reviews] = await Promise.all([
        prisma.article.count({
          where: { contextId, type: "REVIEW", status: "PUBLISHED" },
        }),
        prisma.article.findMany({
          where: { contextId, type: "REVIEW", status: "PUBLISHED" },
          skip,
          take: limit,
          orderBy: [{ createdAt: desc }], // Stars removed, sort by createdAt
          include: {
            author: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    displayName: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        }),
      ]);

      return sendSuccess(req, res, {
        context: {
          id: context.id,
          name: context.name,
          isReviewed: context.isReviewed,
          reviewCount: context.reviewCount,
          avgRating: context.avgRating,
        },
        reviews,
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/map/contexts/:id/articles
  router.get("/map/contexts/:id/articles", async (req, res, next) => {
    try {
      const prisma: any = getPrisma();
      const id = Number(req.params.id);
      if (!Number.isFinite(id) || id <= 0) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid id");
      }

      const context = await prisma.context.findUnique({ where: { id } });
      if (!context) return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");
      if (context.type !== "PLACE") {
        return sendError(req, res, 400, "ERR_VALIDATION", "Context is not PLACE");
      }

      const articles = await prisma.article.findMany({
        where: { contextId: id },
        include: { taxonomies: { include: { taxonomy: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      return sendSuccess(req, res, {
        context,
        articles,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
