import { Router } from "express";
import { z } from "zod";

import { getPrisma } from "../db/prisma";
import { authenticate, requireActiveUser, requireCsrf } from "../middleware/auth";
import { sendError, sendSuccess } from "../utils/response";

const searchSuggestQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  world: z.enum(["open", "private"]).optional().default("open"),
  limit: z.coerce.number().int().min(1).max(30).optional().default(12),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  nearby: z.coerce.boolean().optional().default(false),
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(120),
  world: z.enum(["open", "private"]).optional().default("open"),
  types: z.string().optional().default("place,article"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  minRating: z.coerce.number().min(1).max(5).optional(),
  nearby: z.coerce.boolean().optional().default(false),
  recentDays: z.coerce.number().int().min(1).max(365).optional(),
});

const createPlaceSchema = z.object({
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(3000).optional(),
  category: z.string().trim().max(100).optional(),
  address: z.string().trim().max(500).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const publishReviewSchema = z.object({
  stars: z.number().int().min(1).max(5),
  content: z.string().trim().min(1).max(5000),
  visibility: z.enum(["PUBLIC", "PRIVATE", "PREMIUM"]).optional().default("PUBLIC"),
  isPremium: z.boolean().optional().default(false),
  depositAmount: z.number().int().min(0).optional().default(0),
});

const depositSchema = z.object({
  amount: z.number().int().min(1),
  reason: z.string().trim().max(200).optional(),
});

const importWorldSchema = z.object({
  mode: z.enum(["full", "region"]),
  region: z
    .object({
      minLat: z.number(),
      minLng: z.number(),
      maxLat: z.number(),
      maxLng: z.number(),
    })
    .optional(),
});

function normalize(text: string) {
  return text.toLowerCase().trim();
}

function tokenize(text: string) {
  return normalize(text).split(/\s+/).filter(Boolean);
}

function tokenScore(tokens: string[], haystack: string) {
  if (tokens.length === 0) return 0;
  const lower = normalize(haystack);
  let matched = 0;
  for (const token of tokens) {
    if (lower.includes(token)) matched++;
  }
  return matched / tokens.length;
}

function distanceInMeters(
  aLat?: number | null,
  aLng?: number | null,
  bLat?: number | null,
  bLng?: number | null
) {
  if (
    typeof aLat !== "number" ||
    typeof aLng !== "number" ||
    typeof bLat !== "number" ||
    typeof bLng !== "number"
  ) {
    return null;
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthR = 6371000;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
  return earthR * c;
}

function proximityScore(
  sourceLat?: number | null,
  sourceLng?: number | null,
  userLat?: number,
  userLng?: number
) {
  const distance = distanceInMeters(sourceLat, sourceLng, userLat, userLng);
  if (distance == null) return 0;
  if (distance <= 500) return 1;
  if (distance <= 1500) return 0.75;
  if (distance <= 5000) return 0.45;
  if (distance <= 12000) return 0.18;
  return 0;
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function getPremiumEligibility(prisma: any, userId: number) {
  // Rewritten: use Interaction model (UPVOTE/DOWNVOTE) and Article (type=REVIEW)
  // The old `vote` and `contextReview` tables have been removed from the schema.
  const [upvotes, downvotes, reviewCount] = await Promise.all([
    // UPVOTEs received on this user's articles
    prisma.interaction.count({
      where: {
        type: "UPVOTE",
        article: { authorId: userId },
      },
    }),
    // DOWNVOTEs received on this user's articles
    prisma.interaction.count({
      where: {
        type: "DOWNVOTE",
        article: { authorId: userId },
      },
    }),
    // Published REVIEWs written BY this user
    prisma.article.count({
      where: {
        authorId: userId,
        type: "REVIEW",
        status: "PUBLISHED",
      },
    }),
  ]);

  const ratio = upvotes > 0 ? downvotes / upvotes : 1;
  // avgStars removed: stars field was deleted from schema.
  // New eligibility: 200+ net upvotes, <10% downvote ratio, 5+ published reviews.
  const eligible = upvotes >= 200 && ratio <= 0.10 && reviewCount >= 5;

  return { eligible, upvotes, downvotes, ratio, reviewCount };
}

async function recalculateContextReviewStats(prisma: any, contextId: number) {
  // Rewritten: contextReview table removed. Reviews are now Articles(type=REVIEW).
  const reviewCount = await prisma.article.count({
    where: { contextId, type: "REVIEW", status: "PUBLISHED" },
  });

  await prisma.context.update({
    where: { id: contextId },
    data: {
      reviewCount,
      avgRating: 0.0, // Stars field removed from schema
      isReviewed: reviewCount > 0,
    },
  });
}

export function createMobileRouter() {
  const router = Router();

  router.get("/search/suggest", async (req, res, next) => {
    try {
      const parsed = searchSuggestQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid query", parsed.error.issues);
      }

      const { q, world, limit, lat, lng, minRating, nearby } = parsed.data;
      const prisma = getPrisma();
      const tokens = tokenize(q);

      const userId = Number((req as any).user?.id || 0);
      const isPrivate = world === "private" && userId > 0;

      const placeItems = isPrivate
        ? await prisma.collectionItem.findMany({
            where: {
              collection: {
                userId,
                title: "Favorite Locations",
                isPublic: false
              },
              article: {
                context: {
                  OR: [{ name: { contains: q, mode: "insensitive" } }, { address: { contains: q, mode: "insensitive" } }]
                }
              }
            },
            include: {
              article: {
                include: { context: true }
              }
            },
            take: 120,
            orderBy: { addedAt: "desc" },
          })
        : await prisma.context.findMany({
            where: {
              type: "PLACE",
              ...(minRating !== undefined ? { avgRating: { gte: minRating } } : {}),
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { address: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
              ],
            },
            take: 180,
            orderBy: [{ isReviewed: "desc" }, { avgRating: "desc" }, { updatedAt: "desc" }],
          });

      const items = placeItems
        .map((item: any) => {
          let rowLat, rowLng, name, address, description, category, avgRating, reviewCount, updatedAt, createdAt, id;
          
          if (item.article && item.article.context) {
             const ctx = item.article.context;
             rowLat = typeof ctx.latitude === "number" ? ctx.latitude : ctx.lat;
             rowLng = typeof ctx.longitude === "number" ? ctx.longitude : ctx.lng;
             name = ctx.name;
             address = ctx.address;
             description = ctx.description;
             category = ctx.category;
             avgRating = ctx.avgRating;
             reviewCount = ctx.reviewCount;
             updatedAt = ctx.updatedAt;
             createdAt = ctx.createdAt;
             id = ctx.id;
          } else {
             rowLat = typeof item.latitude === "number" ? item.latitude : item.lat;
             rowLng = typeof item.longitude === "number" ? item.longitude : item.lng;
             name = item.name;
             address = item.address;
             description = item.description;
             category = item.category;
             avgRating = item.avgRating;
             reviewCount = item.reviewCount;
             updatedAt = item.updatedAt;
             createdAt = item.createdAt;
             id = item.id;
          }

          const lexical = tokenScore(tokens, `${name} ${address || ""} ${description || ""} ${category || ""}`);
          const quality = Math.min((Number(avgRating || 0) / 5) * 0.7 + Math.min(Number(reviewCount || 0) / 100, 1) * 0.3, 1);
          const nearbyScore = proximityScore(rowLat, rowLng, lat, lng);
          if (nearby && nearbyScore <= 0) return null;

          const score = lexical * 0.58 + quality * 0.24 + nearbyScore * 0.18;
          return {
            type: "place",
            id: String(id),
            title: String(name),
            subtitle: `${category || "Place"} • ${Number(avgRating || 0).toFixed(1)}★`,
            score: Number(score.toFixed(4)),
            lat: rowLat,
            lng: rowLng,
            rating: Number(avgRating || 0),
            createdAt: updatedAt || createdAt || null,
          };
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, limit);

      return sendSuccess(req, res, { items });
    } catch (err) {
      next(err);
    }
  });

  router.get("/search", async (req, res, next) => {
    try {
      const parsed = searchQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid query", parsed.error.issues);
      }

      const { q, world, types, page, limit, lat, lng, minRating, nearby, recentDays } = parsed.data;
      const prisma = getPrisma();
      const userId = Number((req as any).user?.id || 0);
      const typeSet = new Set(types.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean));
      const tokens = tokenize(q);
      const recentDate = recentDays ? new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000) : null;

      const results: any[] = [];

      if (typeSet.has("place")) {
        const placeRows =
          world === "private" && userId > 0
            ? await prisma.collectionItem.findMany({
                where: {
                  collection: {
                    userId,
                    title: "Favorite Locations",
                    isPublic: false,
                  },
                  article: {
                    context: {
                      OR: [{ name: { contains: q, mode: "insensitive" } }, { address: { contains: q, mode: "insensitive" } }]
                    }
                  }
                },
                include: { article: { include: { context: true } } },
                take: 250,
                orderBy: { addedAt: "desc" },
              })
            : await prisma.context.findMany({
                where: {
                  type: "PLACE",
                  ...(minRating !== undefined ? { avgRating: { gte: minRating } } : {}),
                  ...(recentDate ? { updatedAt: { gte: recentDate } } : {}),
                  OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                    { address: { contains: q, mode: "insensitive" } },
                    { category: { contains: q, mode: "insensitive" } },
                  ],
                },
                take: 300,
                orderBy: [{ isReviewed: "desc" }, { avgRating: "desc" }, { updatedAt: "desc" }],
              });

        for (const rawRow of placeRows as any[]) {
          const row = rawRow.article?.context || rawRow;
          const rowLat = typeof row.latitude === "number" ? row.latitude : row.lat;
          const rowLng = typeof row.longitude === "number" ? row.longitude : row.lng;
          const lexical = tokenScore(tokens, `${row.name} ${row.address || ""} ${row.description || ""} ${row.category || ""}`);
          const quality = Math.min((Number(row.avgRating || 0) / 5) * 0.7 + Math.min(Number(row.reviewCount || 0) / 100, 1) * 0.3, 1);
          const nearbyScore = proximityScore(rowLat, rowLng, lat, lng);
          if (nearby && nearbyScore <= 0) continue;

          const score = lexical * 0.55 + quality * 0.25 + nearbyScore * 0.20;
          results.push({
            type: "place",
            id: String(row.id),
            title: row.name,
            subtitle: `${row.category || "Place"} • ${Number(row.avgRating || 0).toFixed(1)}★`,
            score: Number(score.toFixed(4)),
            location: rowLat != null && rowLng != null ? { lat: rowLat, lng: rowLng } : null,
            meta: {
              reviewCount: Number(row.reviewCount || 0),
              visibility: world === "private" ? "PRIVATE" : "PUBLIC",
            },
          });
        }
      }

      if (typeSet.has("article") && world === "open") {
        const articleRows = await prisma.article.findMany({
          where: {
            ...(recentDate ? { createdAt: { gte: recentDate } } : {}),
            OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }],
          },
          include: {
            author: { include: { profile: true } },
            interactions: false,
          },
          take: 200,
          orderBy: { createdAt: "desc" },
        });

        for (const article of articleRows) {
          const lexical = tokenScore(tokens, `${article.title} ${article.content}`);
          const engagement = Math.min((article.upvoteCount + article.viewCount * 0.08 + article.saveCount * 0.2) / 120, 1);
          const ageDays = Math.max(0, Math.floor((Date.now() - new Date(article.createdAt).getTime()) / (24 * 60 * 60 * 1000)));
          const freshness = Math.max(0, 1 - ageDays / 90);
          const score = lexical * 0.6 + engagement * 0.25 + freshness * 0.15;

          results.push({
            type: "article",
            id: String(article.id),
            title: article.title,
            subtitle: `${article.author?.profile?.displayName || article.author?.email || "Unknown"}`,
            snippet: String(article.content || "").slice(0, 140),
            score: Number(score.toFixed(4)),
            location: null,
            meta: {
              visibility: "PUBLIC",
            },
          });
        }
      }

      results.sort((a, b) => b.score - a.score);
      const total = results.length;
      const start = (page - 1) * limit;
      const items = results.slice(start, start + limit);

      return sendSuccess(req, res, {
        query: q,
        total,
        page,
        limit,
        items,
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/reputation/me/eligibility/premium-review", authenticate, async (req, res, next) => {
    try {
      const userId = Number((req as any).user?.id);
      if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");
      const prisma = getPrisma();
      const metrics = await getPremiumEligibility(prisma, userId);
      return sendSuccess(req, res, metrics);
    } catch (err) {
      next(err);
    }
  });

  router.post("/map/places", authenticate, requireActiveUser, requireCsrf, async (req, res, next) => {
    try {
      const parsed = createPlaceSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const prisma = getPrisma();
      const existing = await prisma.context.findFirst({
        where: {
          type: "PLACE",
          name: parsed.data.name,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
        },
      });
      if (existing) return sendSuccess(req, res, { place: existing, duplicate: true }, 200);

      const created = await prisma.context.create({
        data: {
          type: "PLACE",
          name: parsed.data.name,
          description: parsed.data.description || null,
          category: parsed.data.category || null,
          address: parsed.data.address || null,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
        },
      });
      return sendSuccess(req, res, { place: created }, 201);
    } catch (err) {
      next(err);
    }
  });

  router.post(
    "/map/places/:id/reviews/publish",
    authenticate,
    requireActiveUser,
    requireCsrf,
    async (req, res, next) => {
      try {
        const placeId = Number(req.params.id);
        if (!Number.isFinite(placeId) || placeId <= 0) {
          return sendError(req, res, 400, "ERR_VALIDATION", "Invalid place id");
        }

        const parsed = publishReviewSchema.safeParse(req.body);
        if (!parsed.success) {
          return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
        }

        const userId = Number((req as any).user?.id);
        if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

        const prisma = getPrisma();
        const place = await prisma.context.findUnique({ where: { id: placeId } });
        if (!place || place.type !== "PLACE") {
          return sendError(req, res, 404, "ERR_NOT_FOUND", "Place not found");
        }

        const words = countWords(parsed.data.content);
        const isPublic = parsed.data.visibility === "PUBLIC";
        const wantsPremium = parsed.data.visibility === "PREMIUM" || parsed.data.isPremium === true;
        const depositAmount = parsed.data.depositAmount || 0;

        if (isPublic && words < 100 && depositAmount <= 0) {
          return sendError(
            req,
            res,
            400,
            "ERR_PUBLIC_REVIEW_TOO_SHORT",
            "Public review must be >= 100 words or include a deposit"
          );
        }

        let eligibility: any = null;
        if (wantsPremium) {
          eligibility = await getPremiumEligibility(prisma, userId);
          if (!eligibility.eligible) {
            return sendError(
              req,
              res,
              403,
              "ERR_PREMIUM_NOT_ELIGIBLE",
              "Premium review is locked until your reputation meets the requirement",
              eligibility
            );
          }
        }

        let remainingKnowU: number | null = null;
        if (depositAmount > 0) {
          const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { knowUBalance: true },
          });
          if (!user) return sendError(req, res, 404, "ERR_NOT_FOUND", "User not found");
          if ((user.knowUBalance || 0) < depositAmount) {
            return sendError(req, res, 400, "ERR_INSUFFICIENT_KNOW_U", "Insufficient KNOW-U balance");
          }

          const txResult = await prisma.$transaction(async (tx: any) => {
            const updated = await tx.user.update({
              where: { id: userId },
              data: {
                knowUBalance: { decrement: depositAmount },
              },
              select: { knowUBalance: true },
            });

            await tx.walletTransaction.create({
              data: {
                userId,
                type: "SPEND",
                currency: "KNOW_U",
                amount: depositAmount,
                reasonCode: "MAP_REVIEW_DEPOSIT",
                refId: placeId,
              },
            });
            return updated;
          });

          remainingKnowU = Number(txResult?.knowUBalance || 0);
        }

        // Handle upsert manually
        let review = await prisma.article.findFirst({
          where: {
            contextId: placeId,
            authorId: userId,
            type: "REVIEW"
          }
        });

        if (review) {
          review = await prisma.article.update({
            where: { id: review.id },
            data: {
              content: parsed.data.content,
              status: "PUBLISHED"
            }
          });
        } else {
          review = await prisma.article.create({
            data: {
              contextId: placeId,
              authorId: userId,
              type: "REVIEW",
              slug: `review-${placeId}-${userId}-${Date.now()}`,
              content: parsed.data.content,
              title: `Review for Context ${placeId}`,
              status: "PUBLISHED"
            }
          });
        }

        await recalculateContextReviewStats(prisma, placeId);

        return sendSuccess(
          req,
          res,
          {
            review,
            visibility: parsed.data.visibility,
            isPremium: wantsPremium,
            wordCount: words,
            depositAmount,
            remainingKnowU,
            eligibility,
          },
          201
        );
      } catch (err) {
        next(err);
      }
    }
  );

  router.post("/map/places/:id/deposits", authenticate, requireActiveUser, requireCsrf, async (req, res, next) => {
    try {
      const placeId = Number(req.params.id);
      if (!Number.isFinite(placeId) || placeId <= 0) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid place id");
      }
      const parsed = depositSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const userId = Number((req as any).user?.id);
      if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");
      const prisma = getPrisma();

      const place = await prisma.context.findUnique({ where: { id: placeId } });
      if (!place || place.type !== "PLACE") {
        return sendError(req, res, 404, "ERR_NOT_FOUND", "Place not found");
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { knowUBalance: true },
      });
      if (!user) return sendError(req, res, 404, "ERR_NOT_FOUND", "User not found");
      if ((user.knowUBalance || 0) < parsed.data.amount) {
        return sendError(req, res, 400, "ERR_INSUFFICIENT_KNOW_U", "Insufficient KNOW-U balance");
      }

      const result = await prisma.$transaction(async (tx: any) => {
        const updated = await tx.user.update({
          where: { id: userId },
          data: { knowUBalance: { decrement: parsed.data.amount } },
          select: { knowUBalance: true },
        });
        const pointTx = await tx.walletTransaction.create({
          data: {
            userId,
            type: "SPEND",
            currency: "KNOW_U",
            amount: parsed.data.amount,
            reasonCode: parsed.data.reason || "MAP_PLACE_DEPOSIT",
            refId: placeId,
          },
        });
        return { updated, pointTx };
      });

      return sendSuccess(req, res, {
        deposit: result.pointTx,
        remainingKnowU: result.updated.knowUBalance,
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/world/import", authenticate, requireActiveUser, requireCsrf, async (req, res, next) => {
    try {
      const parsed = importWorldSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const userId = Number((req as any).user?.id);
      if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");
      const prisma = getPrisma();

      const where: any = { type: "PLACE" };
      if (parsed.data.mode === "region") {
        if (!parsed.data.region) {
          return sendError(req, res, 400, "ERR_VALIDATION", "Region is required for region import");
        }
        where.latitude = {
          gte: parsed.data.region.minLat,
          lte: parsed.data.region.maxLat,
        };
        where.longitude = {
          gte: parsed.data.region.minLng,
          lte: parsed.data.region.maxLng,
        };
      }

      const places = await prisma.context.findMany({
        where,
        take: parsed.data.mode === "full" ? 1500 : 400,
        orderBy: [{ isReviewed: "desc" }, { avgRating: "desc" }, { updatedAt: "desc" }],
      });

      // To import favorites, we find or create a collection for "Favorite Locations"
      let favCollection = await prisma.collection.findFirst({
        where: { userId, title: "Favorite Locations", isPublic: false }
      });
      if (!favCollection) {
        favCollection = await prisma.collection.create({
          data: {
            userId,
            title: "Favorite Locations",
            isPublic: false,
          }
        });
      }

      const existingFavorites = await prisma.collectionItem.findMany({
        where: { collectionId: favCollection.id },
        include: { article: { include: { context: true } } }
      });
      const existingKeys = new Set(
        existingFavorites
          .map((item: any) => item.article?.context)
          .filter(Boolean)
          .map((ctx: any) => `${ctx.name}::${Number(ctx.latitude).toFixed(6)}::${Number(ctx.longitude).toFixed(6)}`)
      );

      // In the new schema we don't duplicate context. The favorite is a relation.
      // Easiest is to create Articles and link them, but since we are importing contexts
      // into a "favorite locations" list, we must create Articles for those contexts if they don't exist
      // and then create collection records.
      const toCreateContexts = places
        .filter((item: any) => typeof item.latitude === "number" && item.longitude === "number")
        .filter((item: any) => {
          const key = `${item.name}::${Number(item.latitude).toFixed(6)}::${Number(item.longitude).toFixed(6)}`;
          if (existingKeys.has(key)) return false;
          existingKeys.add(key);
          return true;
        });

      let imported = 0;
      for (const ctx of toCreateContexts) {
        let article = await prisma.article.findFirst({
           where: { contextId: ctx.id, authorId: userId }
        });
        if (!article) {
           article = await prisma.article.create({
             data: {
               slug: `imported-${ctx.id}-${Date.now()}`,
               title: `Imported Location: ${ctx.name}`,
               content: '',
               type: 'POST',
               authorId: userId,
               contextId: ctx.id,
             }
           });
        }
        await prisma.collectionItem.create({
           data: {
             collectionId: favCollection.id,
             articleId: article.id
           }
        });
        imported++;
      }

      return sendSuccess(req, res, {
        mode: parsed.data.mode,
        imported: toCreateContexts.length,
        scanned: places.length,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}

