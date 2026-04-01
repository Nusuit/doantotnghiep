import { Router } from "express";
import { z } from "zod";
import { getPrisma } from "../db/prisma";
import { authenticate } from "../middleware/auth";
import { sendSuccess, sendError } from "../utils/response";

const savePlaceSchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    category: z.string().optional(),
});

const favoriteIdParamSchema = z.object({
    favoriteId: z.string().min(1),
});

export function createMapRouter() {
    const router = Router();

    // GET /api/map/favorites – Lấy danh sách địa điểm đã lưu
    router.get("/favorites", authenticate, async (req, res) => {
        try {
            const userId = Number((req as any).user?.id);
            const prisma = getPrisma();

            const favorites = await prisma.favoriteLocation.findMany({
                where: { userId },
                orderBy: { createdAt: "desc" },
            });

            const data = favorites.map((fav) => ({
                id: fav.id,
                name: fav.name,
                address: fav.address,
                coordinates: { lat: fav.lat, lng: fav.lng },
                category: fav.category,
                createdAt: fav.createdAt,
            }));

            return sendSuccess(req, res, data);
        } catch (err) {
            console.error("[map/favorites GET]", err);
            return sendError(req, res, 500, "ERR_INTERNAL", "Không thể lấy danh sách đã lưu");
        }
    });

    // POST /api/map/favorites – Lưu địa điểm
    router.post("/favorites", authenticate, async (req, res) => {
        const parsed = savePlaceSchema.safeParse(req.body);
        if (!parsed.success) {
            return sendError(req, res, 400, "ERR_VALIDATION", "Dữ liệu không hợp lệ", parsed.error.issues);
        }

        try {
            const userId = Number((req as any).user?.id);
            const { name, address, lat, lng, category } = parsed.data;
            const prisma = getPrisma();

            const favorite = await prisma.favoriteLocation.create({
                data: {
                    userId,
                    name,
                    address,
                    lat,
                    lng,
                    category: category ?? "general",
                },
            });

            return sendSuccess(
                req,
                res,
                {
                    id: favorite.id,
                    name: favorite.name,
                    address: favorite.address,
                    coordinates: { lat: favorite.lat, lng: favorite.lng },
                    category: favorite.category,
                    createdAt: favorite.createdAt,
                },
                201
            );
        } catch (err) {
            console.error("[map/favorites POST]", err);
            return sendError(req, res, 500, "ERR_INTERNAL", "Không thể lưu địa điểm");
        }
    });

    // DELETE /api/map/favorites/:favoriteId – Bỏ lưu địa điểm
    router.delete("/favorites/:favoriteId", authenticate, async (req, res) => {
        const parsed = favoriteIdParamSchema.safeParse(req.params);
        if (!parsed.success) {
            return sendError(req, res, 400, "ERR_VALIDATION", "ID không hợp lệ");
        }

        try {
            const userId = Number((req as any).user?.id);
            const { favoriteId } = parsed.data;
            const prisma = getPrisma();

            const existing = await prisma.favoriteLocation.findFirst({
                where: { id: favoriteId, userId },
            });

            if (!existing) {
                return sendError(req, res, 404, "ERR_NOT_FOUND", "Không tìm thấy địa điểm đã lưu");
            }

            await prisma.favoriteLocation.delete({ where: { id: favoriteId } });

            return sendSuccess(req, res, null, 200);
        } catch (err) {
            console.error("[map/favorites DELETE]", err);
            return sendError(req, res, 500, "ERR_INTERNAL", "Không thể xóa địa điểm");
        }
    });

    return router;
}
