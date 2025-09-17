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

// POST /api/places/:id/hold
router.post("/places/:id/hold", authenticateJWT, async (req, res) => {
  const placeId = req.params.id;
  const userId = req.user.id;
  // Kiểm tra số dư
  const credits = await prisma.ledger.aggregate({
    where: { userId, type: "credit" },
    _sum: { amount: true },
  });
  const debits = await prisma.ledger.aggregate({
    where: { userId, type: "debit" },
    _sum: { amount: true },
  });
  const coin = (credits._sum.amount || 0) - (debits._sum.amount || 0);
  if (coin < 50) return res.status(400).json({ error: "Not enough coin" });
  // Kiểm tra đã có người giữ chỗ chưa
  const activeHold = await prisma.hold.findFirst({
    where: { placeId, expiredAt: { gt: new Date() } },
  });
  if (activeHold) return res.status(400).json({ error: "Place already held" });
  // Trừ 50 coin
  await prisma.ledger.create({
    data: {
      userId,
      type: "debit",
      amount: 50,
      ref: "hold_place",
      createdAt: new Date(),
    },
  });
  // Tạo hold, đặt expiredAt sau 72h
  const expiredAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const hold = await prisma.hold.create({
    data: { userId, placeId, startedAt: new Date(), expiredAt },
  });
  res.json({ hold });
});

// POST /api/holds/:hid/submit
router.post("/:hid/submit", authenticateJWT, async (req, res) => {
  const holdId = req.params.hid;
  const userId = req.user.id;
  const hold = await prisma.hold.findUnique({ where: { id: holdId } });
  if (!hold || hold.userId !== userId || hold.expiredAt < new Date())
    return res.status(400).json({ error: "Invalid or expired hold" });
  // Tạo bài review liên kết với địa điểm
  const review = await prisma.article.create({
    data: { authorId: userId, placeId: hold.placeId, ...req.body },
  });
  // Giải phóng hold
  await prisma.hold.update({
    where: { id: holdId },
    data: { releasedAt: new Date() },
  });
  // Hoàn cọc 50 coin cho user
  await prisma.ledger.create({
    data: {
      userId,
      type: "credit",
      amount: 50,
      ref: "hold_refund",
      createdAt: new Date(),
    },
  });
  res.json({ review });
});

// POST /api/holds/:hid/cancel
router.post("/:hid/cancel", async (req, res) => {
  res.json({ message: "cancel hold" });
});

module.exports = router;
