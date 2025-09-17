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

// GET /api/quests
router.get("/", async (req, res) => {
  // Trả về danh sách nhiệm vụ tân thủ
  const quests = await prisma.quest.findMany({ orderBy: { order: "asc" } });
  res.json({ quests });
});

// GET /api/quests/progress
router.get("/progress", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  // Lấy tiến độ nhiệm vụ của user
  const progress = await prisma.questProgress.findMany({ where: { userId } });
  res.json({ progress });
});

// POST /api/quests/progress
router.post("/progress", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { questId } = req.body;
  // Kiểm tra nhiệm vụ đã hoàn thành chưa
  const progress = await prisma.questProgress.findUnique({
    where: { userId_questId: { userId, questId } },
  });
  if (!progress || progress.completed)
    return res
      .status(400)
      .json({ error: "Quest not available or already completed" });
  // Đánh dấu hoàn thành và trao thưởng
  await prisma.questProgress.update({
    where: { userId_questId: { userId, questId } },
    data: { completed: true, completedAt: new Date() },
  });
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (quest && quest.reward) {
    await prisma.ledger.create({
      data: {
        userId,
        type: "credit",
        amount: quest.reward,
        ref: "quest_reward",
        createdAt: new Date(),
      },
    });
  }
  res.json({ message: "Quest completed", reward: quest?.reward || 0 });
});

module.exports = router;
