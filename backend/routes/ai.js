const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { checkAILimit } = require("../src/modules/ai/limits");
const { logWalletAction } = require("../src/modules/wallet/auditTrail");

// POST /api/ai/chat/sessions
router.post("/chat/sessions", async (req, res) => {
  const userId = req.user?.id;
  const { plan } = req.body;
  if (!userId || !plan)
    return res.status(400).json({ error: "Missing user or plan" });

  // Check coin balance (stub: 100 coins required)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.coins < 100)
    return res.status(402).json({ error: "Not enough coins" });

  // Trừ coin
  await prisma.user.update({
    where: { id: userId },
    data: { coins: { decrement: 100 } },
  });
  logWalletAction(userId, "ai_session_create", 100, "AI Chat Session");

  // Tạo session
  const session = await prisma.aiChatSession.create({
    data: {
      userId,
      plan,
      createdAt: new Date(),
      quota: plan === "pro" ? 100 : 20,
    },
  });
  res.json({ sessionId: session.id, quota: session.quota });
});

// POST /api/ai/chat/messages
router.post("/chat/messages", async (req, res) => {
  const userId = req.user?.id;
  const { sessionId, message } = req.body;
  if (!userId || !sessionId || !message)
    return res.status(400).json({ error: "Missing params" });

  // Lấy session
  const session = await prisma.aiChatSession.findUnique({
    where: { id: sessionId },
  });
  if (!session || session.userId !== userId)
    return res.status(404).json({ error: "Session not found" });

  // Kiểm tra quota
  const msgCount = await prisma.aiChatMessage.count({ where: { sessionId } });
  if (msgCount >= session.quota) {
    // Trừ coin nếu vượt quota (stub: 10 coins/lần vượt)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.coins < 10)
      return res
        .status(402)
        .json({ error: "Quota exceeded, not enough coins" });
    await prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: 10 } },
    });
    logWalletAction(
      userId,
      "ai_msg_quota_exceed",
      10,
      `AI Chat Msg ${sessionId}`
    );
  }

  // Stub gọi AI (OpenAI)
  const aiReply = `AI trả lời: ${message}`;

  // Lưu message
  await prisma.aiChatMessage.create({
    data: {
      sessionId,
      userId,
      message,
      aiReply,
      createdAt: new Date(),
    },
  });
  res.json({ reply: aiReply });
});

module.exports = router;
