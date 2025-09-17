const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const requireAuth = require("../src/middleware/requireAuth");

const { validate } = require("../src/middleware/validate");
const { z } = require("zod");

const suggestionSchema = z.object({
  content: z.string().min(10).max(1000),
});

// POST /api/articles/:id/suggestions
router.post(
  "/articles/:id/suggestions",
    requireAuth,
  validate(suggestionSchema),
  async (req, res, next) => {
    try {
      const articleId = req.params.id;
      const userId = req.user.id;
      // Kiểm tra đã có suggestion chưa
      const existing = await prisma.suggestion.findFirst({
        where: { articleId, userId, status: { in: ["pending", "appeal"] } },
      });
      if (existing) {
        return next({
          code: "ERR_SUGGESTION_EXISTS",
          status: 429,
          message: messages.ERR_SUGGESTION_EXISTS,
        });
      }
      // Kiểm tra tần suất gửi (cách nhau 5 phút)
      const last = await prisma.suggestion.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (last && new Date() - last.createdAt < 5 * 60 * 1000) {
        return next({
          code: "ERR_SUGGESTION_TOO_FAST",
          status: 429,
          message: messages.ERR_SUGGESTION_TOO_FAST,
        });
      }
      // Kiểm tra số dư coin
      const balance = await prisma.ledger.aggregate({
        where: { userId, type: "credit" },
        _sum: { amount: true },
      });
      const debits = await prisma.ledger.aggregate({
        where: { userId, type: "debit" },
        _sum: { amount: true },
      });
      const coin = (balance._sum.amount || 0) - (debits._sum.amount || 0);
      if (coin < config.COIN_SUGGESTION)
        return next({
          code: "ERR_NOT_ENOUGH_COIN",
          status: 400,
          message: messages.ERR_NOT_ENOUGH_COIN,
        });
      // Trừ coin
      await prisma.ledger.create({
        data: {
          userId,
          type: "debit",
          amount: config.COIN_SUGGESTION,
          ref: "suggestion",
          createdAt: new Date(),
        },
      });
      // Tạo suggestion
      const suggestion = await prisma.suggestion.create({
        data: { articleId, userId, status: "pending", ...req.body },
      });
      res.json({
        code: "OK",
        message: "Đã gửi đề xuất chỉnh sửa",
        data: suggestion,
      });
    } catch (err) {
      next({
        code: "ERR_CREATE_SUGGESTION",
        status: 500,
        message: err.message,
      });
    }
  }
);

// GET /api/articles/:id/suggestions
router.get("/articles/:id/suggestions", async (req, res) => {
  res.json({ message: "list suggestions" });
});

// POST /api/suggestions/:sid/accept
router.post("/:sid/accept", async (req, res) => {
  const sid = req.params.sid;
  const userId = req.user?.id;
  // Lấy suggestion và bài viết
  const suggestion = await prisma.suggestion.findUnique({ where: { id: sid } });
  if (!suggestion)
    return res.status(404).json({ error: "Suggestion not found" });
  const article = await prisma.article.findUnique({
    where: { id: suggestion.articleId },
  });
  if (!article) return res.status(404).json({ error: "Article not found" });
  // Chỉ cho phép tác giả chính accept
  if (article.authorId !== userId)
    return res.status(403).json({ error: "Not article author" });
  // ...existing code...
  res.json({ message: "accept suggestion" });
});

// POST /api/suggestions/:sid/reject
router.post("/:sid/reject", async (req, res) => {
  res.json({ message: "reject suggestion" });
});

// POST /api/suggestions/:sid/appeal
router.post("/:sid/appeal", authenticateJWT, async (req, res) => {
router.post("/:sid/appeal", requireAuth, async (req, res) => {
  const sid = req.params.sid;
  const userId = req.user.id;
  // Kiểm tra suggestion thuộc về user và trạng thái là rejected
  const suggestion = await prisma.suggestion.findUnique({ where: { id: sid } });
  if (
    !suggestion ||
    suggestion.userId !== userId ||
    suggestion.status !== "rejected"
  ) {
    return res.status(400).json({ error: "Cannot appeal this suggestion" });
  }
  // Chuyển trạng thái sang appeal
  await prisma.suggestion.update({
    where: { id: sid },
    data: { status: "appeal" },
  });
  // Tạo record cho hội đồng phán quyết nếu cần
  res.json({ message: "Suggestion appealed" });
});

// GET/POST /api/judiciary/cases
router.get("/judiciary/cases", async (req, res) => {
  // Lấy danh sách vụ phán quyết, có thể lọc theo trạng thái
  const cases = await prisma.judiciaryCase.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json({ cases });
});
router.post("/judiciary/cases", authenticateJWT, async (req, res) => {
  // Tạo vụ phán quyết cho suggestion appeal
  const { suggestionId, councilIds } = req.body;
  // Kiểm tra suggestion ở trạng thái appeal
  const suggestion = await prisma.suggestion.findUnique({
    where: { id: suggestionId },
  });
  if (!suggestion || suggestion.status !== "appeal")
    return res.status(400).json({ error: "Invalid suggestion for judiciary" });
  // Tạo vụ phán quyết, chọn hội đồng
  const caseRecord = await prisma.judiciaryCase.create({
    data: {
      suggestionId,
      councilIds,
      status: "pending",
      createdAt: new Date(),
    },
  });
  res.json({ case: caseRecord });
});

module.exports = router;
