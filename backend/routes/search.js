const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET /api/search
router.get("/", async (req, res) => {
  const { q, type } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query" });
  let results = [];
  if (!type || type === "all") {
    // Tìm kiếm hợp nhất
    const places = await prisma.place.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 10,
    });
    const articles = await prisma.article.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 10,
    });
    const users = await prisma.user.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 10,
    });
    results = [...places, ...articles, ...users];
  } else if (type === "place") {
    results = await prisma.place.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 20,
    });
  } else if (type === "article") {
    results = await prisma.article.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 20,
    });
  } else if (type === "user") {
    results = await prisma.user.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 20,
    });
  }
  res.json({ results });
});

module.exports = router;
