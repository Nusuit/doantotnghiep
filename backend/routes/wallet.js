const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");
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

// GET /api/wallet
router.get("/", async (req, res) => {
  res.json({ message: "get wallet info" });
});

// POST /api/wallet/charge
router.post("/charge", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { amount, provider } = req.body;
  // Tạo order nạp coin (giả lập, chưa tích hợp cổng thanh toán)
  const order = await prisma.payment.create({
    data: {
      userId,
      amount,
      provider,
      status: "pending",
      createdAt: new Date(),
    },
  });
  // Trả về orderId để frontend redirect tới cổng thanh toán
  res.json({ orderId: order.id });
});

// POST /api/webhooks/payment
router.post("/webhooks/payment", async (req, res) => {
  const { orderId, signature } = req.body;
  // Xác minh chữ ký webhook
  const payload = JSON.stringify(req.body);
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  if (signature !== expected)
    return res.status(400).json({ error: "Invalid signature" });
  // Cộng coin cho user
  const order = await prisma.payment.findUnique({ where: { id: orderId } });
  if (!order || order.status !== "pending")
    return res.status(400).json({ error: "Invalid order" });
  await prisma.ledger.create({
    data: {
      userId: order.userId,
      type: "credit",
      amount: order.amount,
      ref: "wallet_charge",
      createdAt: new Date(),
    },
  });
  await prisma.payment.update({
    where: { id: orderId },
    data: { status: "success" },
  });
  res.json({ message: "Payment processed" });
});

// POST /api/wallet/transfer
router.post("/transfer", authenticateJWT, async (req, res) => {
  const fromId = req.user.id;
  const { toId, amount } = req.body;
  if (fromId === toId)
    return res.status(400).json({ error: "Cannot transfer to yourself" });
  // Kiểm tra số dư
  const credits = await prisma.ledger.aggregate({
    where: { userId: fromId, type: "credit" },
    _sum: { amount: true },
  });
  const debits = await prisma.ledger.aggregate({
    where: { userId: fromId, type: "debit" },
    _sum: { amount: true },
  });
  const coin = (credits._sum.amount || 0) - (debits._sum.amount || 0);
  if (coin < amount) return res.status(400).json({ error: "Not enough coin" });
  // Trừ coin người gửi
  await prisma.ledger.create({
    data: {
      userId: fromId,
      type: "debit",
      amount,
      ref: "wallet_transfer",
      createdAt: new Date(),
    },
  });
  // Cộng coin người nhận
  await prisma.ledger.create({
    data: {
      userId: toId,
      type: "credit",
      amount,
      ref: "wallet_transfer",
      createdAt: new Date(),
    },
  });
  res.json({ message: "Transfer completed" });
});

module.exports = router;
