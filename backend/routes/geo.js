const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/geo/places-in-bounds
// Query: ?swLat=...&swLng=...&neLat=...&neLng=...
router.get("/places-in-bounds", async (req, res) => {
  const { swLat, swLng, neLat, neLng } = req.query;
  if (!swLat || !swLng || !neLat || !neLng)
    return res.status(400).json({ error: "Missing bounds" });
  // Tìm các địa điểm trong bounding box
  const places = await prisma.place.findMany({
    where: {
      lat: { gte: parseFloat(swLat), lte: parseFloat(neLat) },
      lng: { gte: parseFloat(swLng), lte: parseFloat(neLng) },
    },
    select: { id: true, name: true, lat: true, lng: true },
  });
  res.json({ places });
});

// GET /api/geo/heatmap
// Trả về các vùng có ít nội dung (ví dụ: < 3 địa điểm trong mỗi grid)
router.get("/heatmap", async (req, res) => {
  // Chia map thành grid 0.1 độ, đếm số địa điểm mỗi grid
  const places = await prisma.place.findMany({
    select: { lat: true, lng: true },
  });
  const grid = {};
  places.forEach((p) => {
    const key = `${Math.floor(p.lat * 10) / 10},${Math.floor(p.lng * 10) / 10}`;
    grid[key] = (grid[key] || 0) + 1;
  });
  // Chỉ lấy grid có < 3 địa điểm
  const heatmap = Object.entries(grid)
    .filter(([_, count]) => count < 3)
    .map(([key, count]) => ({ grid: key, count }));
  res.json({ heatmap });
});

module.exports = router;
