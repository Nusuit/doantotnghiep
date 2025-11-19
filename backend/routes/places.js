const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { validate } = require("../middleware/validate");
const { z } = require("zod");

const placeSchema = z.object({
  name: z.string().min(2).max(64),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// POST /api/places
router.post("/", validate(placeSchema), async (req, res, next) => {
  try {
    // ...existing code...
    res.json({ message: "create place" });
  } catch (err) {
    next({ code: "ERR_CREATE_PLACE", status: 500, message: err.message });
  }
});

// GET /api/places
router.get("/", async (req, res, next) => {
  try {
    let { page = 1, limit = 20 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 20;
    const skip = (page - 1) * limit;
    const [totalItems, places] = await Promise.all([
      prisma.place.count(),
      prisma.place.findMany({
        skip,
        take: limit,
        select: { id: true, name: true, lat: true, lng: true },
      }),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    res.json({
      code: "OK",
      message: "Danh sách địa điểm",
      data: places,
      page,
      totalPages,
      totalItems,
    });
  } catch (err) {
    next({ code: "ERR_LIST_PLACE", status: 500, message: err.message });
  }
});

// GET /api/places/:id
router.get("/:id", async (req, res, next) => {
  try {
    // ...existing code...
    res.json({ message: "get place detail" });
  } catch (err) {
    next({ code: "ERR_GET_PLACE", status: 500, message: err.message });
  }
});

// GET /api/places/nearby
router.get("/nearby", async (req, res, next) => {
  try {
    const { lat, lng, radius = 1000 } = req.query;
    if (!lat || !lng)
      return next({
        code: "ERR_MISSING_COORD",
        status: 400,
        message: "Missing lat/lng",
      });
    // ...existing code...
    const places =
      await prisma.$queryRaw`SELECT * FROM place WHERE ST_Distance_Sphere(point(${Number(
        lng
      )}, ${Number(lat)}), location) < ${Number(radius)}`;
    res.json({ places });
  } catch (err) {
    next({ code: "ERR_NEARBY_PLACE", status: 500, message: err.message });
  }
});

module.exports = router;
