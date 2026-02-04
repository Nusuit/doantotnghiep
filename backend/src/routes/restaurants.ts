import { Router } from "express";
import { z } from "zod";
import { getPrisma } from "../db/prisma";
import { sendError, sendSuccess } from "../utils/response";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  bbox: z.string().optional(),
  category: z.string().optional(),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  category: z.string().optional(),
});

export function createRestaurantsRouter() {
  const router = Router();

  // Read-only alias of PLACE Contexts
  router.get("/", async (req, res, next) => {
    try {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid query", parsed.error.issues);
      }

      const prisma = getPrisma() as any;
      const { limit, offset, bbox, category } = parsed.data;

      const where: any = { type: "PLACE" };
      if (category) where.category = category.trim();

      if (bbox) {
        const parts = bbox.split(",").map((v) => Number(v));
        if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
          const [minLng, minLat, maxLng, maxLat] = parts;
          where.latitude = { gte: minLat, lte: maxLat };
          where.longitude = { gte: minLng, lte: maxLng };
        }
      }

      const [contexts, total] = await Promise.all([
        prisma.context.findMany({
          where,
          orderBy: { updatedAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.context.count({ where }),
      ]);

      return sendSuccess(req, res, {
        restaurants: contexts.map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          address: c.address,
          latitude: c.latitude,
          longitude: c.longitude,
          category: c.category,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        pagination: { total, limit, offset, hasMore: offset + limit < total },
      });
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req, res, next) => {
    try {
      const parsed = idParamSchema.safeParse(req.params);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid id", parsed.error.issues);
      }

      const prisma = getPrisma() as any;
      const ctx = await prisma.context.findFirst({ where: { id: parsed.data.id, type: "PLACE" } });
      if (!ctx) return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");

      return sendSuccess(req, res, {
        restaurant: {
          id: ctx.id,
          name: ctx.name,
          description: ctx.description,
          address: ctx.address,
          latitude: ctx.latitude,
          longitude: ctx.longitude,
          category: ctx.category,
          createdAt: ctx.createdAt,
          updatedAt: ctx.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  // Create PLACE context (restaurants, parks, etc.)
  router.post("/", async (req, res, next) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const prisma = getPrisma() as any;
      const created = await prisma.context.create({
        data: {
          type: "PLACE",
          name: parsed.data.name.trim(),
          description: parsed.data.description?.trim() || null,
          address: parsed.data.address?.trim() || null,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
          category: parsed.data.category?.trim() || null,
        },
      });

      return sendSuccess(
        req,
        res,
        {
          restaurant: {
            id: created.id,
            name: created.name,
            description: created.description,
            address: created.address,
            latitude: created.latitude,
            longitude: created.longitude,
            category: created.category,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
          },
        },
        201
      );
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", (req, res) => sendError(req, res, 403, "ERR_FORBIDDEN", "Disabled in MVP"));
  router.delete("/:id", (req, res) => sendError(req, res, 403, "ERR_FORBIDDEN", "Disabled in MVP"));

  return router;
}
