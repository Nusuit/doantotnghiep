const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// GET/PUT /api/users/me
router.get("/me", async (req, res) => {
  res.json({ message: "get my profile" });
});
router.put("/me", async (req, res) => {
  res.json({ message: "update my profile" });
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  res.json({ message: "get user profile" });
});

// POST /api/users/:id/follow
router.post("/:id/follow", authenticateJWT, async (req, res) => {
  const targetId = req.params.id;
  const userId = req.user.id;
  if (userId === targetId)
    return res.status(400).json({ error: "Cannot follow yourself" });
  const existing = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId: userId, followingId: targetId },
    },
  });
  if (existing) return res.status(400).json({ error: "Already following" });
  await prisma.follow.create({
    data: { followerId: userId, followingId: targetId },
  });
  res.json({ message: "followed" });
});

// DELETE /api/users/:id/follow
router.delete("/:id/follow", authenticateJWT, async (req, res) => {
  const targetId = req.params.id;
  const userId = req.user.id;
  if (userId === targetId)
    return res.status(400).json({ error: "Cannot unfollow yourself" });
  await prisma.follow.deleteMany({
    where: { followerId: userId, followingId: targetId },
  });
  res.json({ message: "unfollowed" });
});

// GET /api/users/:id/followers
router.get("/:id/followers", async (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });
  res.json({ followers, page, pageSize });
});

// GET /api/users/:id/following
router.get("/:id/following", async (req, res) => {
  const userId = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: "desc" },
  });
  res.json({ following, page, pageSize });
});

// GET /api/users/:id/reputation
router.get("/:id/reputation", async (req, res) => {
  const userId = req.params.id;
  // Ví dụ: tính điểm uy tín dựa trên số bài viết, số follower, v.v.
  const articles = await prisma.article.count({ where: { authorId: userId } });
  const followers = await prisma.follow.count({
    where: { followingId: userId },
  });
  const reputation = articles * 10 + followers * 2;
  let level = "Newbie";
  if (reputation > 100) level = "Contributor";
  if (reputation > 500) level = "Expert";
  res.json({ reputation, level });
});

module.exports = router;
