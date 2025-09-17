const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
  } catch (err) {}
  next();
}

// GET /api/discovery/weekly
router.get("/weekly", async (req, res) => {
  // Lấy bài viết nổi bật trong tuần
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const articles = await prisma.article.findMany({
    where: { createdAt: { gte: weekAgo } },
    orderBy: [{ upvotes: "desc" }],
    take: 10,
    include: { author: true },
  });
  res.json({ weekly: articles });
});

// GET /api/discovery/recommended
router.get("/recommended", authenticateJWT, async (req, res) => {
  // Gợi ý bài viết theo sở thích/lịch sử (giả lập: bài viết nhiều upvote, cùng địa điểm với bài đã xem)
  let articles = [];
  if (req.user) {
    // Lấy các địa điểm user đã xem
    const unlocks = await prisma.articleUnlock.findMany({
      where: { userId: req.user.id },
    });
    const placeIds = unlocks.map((u) => u.placeId).filter(Boolean);
    articles = await prisma.article.findMany({
      where: { placeId: { in: placeIds } },
      orderBy: [{ upvotes: "desc" }],
      take: 10,
      include: { author: true },
    });
  } else {
    articles = await prisma.article.findMany({
      orderBy: [{ upvotes: "desc" }],
      take: 10,
      include: { author: true },
    });
  }
  res.json({ recommended: articles });
});

module.exports = router;
