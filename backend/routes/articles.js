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

// POST /api/articles
router.post("/", async (req, res, next) => {
  try {
    // Implementation for creating article
    const { title, content, placeId } = req.body;

    // Basic validation
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        placeId: placeId || null,
        authorId: req.user ? req.user.id : null,
      },
    });

    res.json({
      code: "OK",
      message: "Article created successfully",
      data: article,
    });
  } catch (err) {
    next({ code: "ERR_CREATE_ARTICLE", status: 500, message: err.message });
  }
});

// GET /api/places/:placeId/article
router.get("/place/:placeId", async (req, res) => {
  res.json({ message: "get article for place" });
});

// GET /api/articles/featured
router.get("/featured", async (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if (page < 1) page = 1;
    if (limit < 1 || limit > 50) limit = 10;
    const skip = (page - 1) * limit;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const [totalItems, articles] = await Promise.all([
      prisma.article.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.article.findMany({
        where: { createdAt: { gte: weekAgo } },
        orderBy: [{ upvotes: "desc" }, { author: { reputation: "desc" } }],
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, reputation: true } },
        },
      }),
    ]);
    const totalPages = Math.ceil(totalItems / limit);
    // Ẩn trường nhạy cảm nếu có
    const safeArticles = articles.map((a) => ({
      id: a.id,
      title: a.title,
      upvotes: a.upvotes,
      createdAt: a.createdAt,
      author: a.author,
    }));
    res.json({
      code: "OK",
      message: "Danh sách bài viết nổi bật",
      data: safeArticles,
      page,
      totalPages,
      totalItems,
    });
  } catch (err) {
    next({ code: "ERR_FEATURED_ARTICLE", status: 500, message: err.message });
  }
});

// POST /api/articles/:id/premium
router.post("/:id/premium", authenticateJWT, async (req, res) => {
  const articleId = req.params.id;
  const userId = req.user.id;
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article || article.authorId !== userId)
    return res.status(403).json({ error: "Not allowed" });
  // Kiểm tra số dư coin
  const credits = await prisma.ledger.aggregate({
    where: { userId, type: "credit" },
    _sum: { amount: true },
  });
  const debits = await prisma.ledger.aggregate({
    where: { userId, type: "debit" },
    _sum: { amount: true },
  });
  const coin = (credits._sum.amount || 0) - (debits._sum.amount || 0);
  if (coin < 150) return res.status(400).json({ error: "Not enough coin" });
  // Trừ 150 coin
  await prisma.ledger.create({
    data: {
      userId,
      type: "debit",
      amount: 150,
      ref: "premium_article",
      createdAt: new Date(),
    },
  });
  // Đánh dấu bài viết là premium
  await prisma.article.update({
    where: { id: articleId },
    data: { isPremium: true, price: req.body.price || 0 },
  });
  res.json({ message: "Article upgraded to premium" });
});

// POST /api/articles/:id/unlock
router.post("/:id/unlock", authenticateJWT, async (req, res) => {
  const articleId = req.params.id;
  const userId = req.user.id;
  const article = await prisma.article.findUnique({ where: { id: articleId } });
  if (!article || !article.isPremium)
    return res.status(404).json({ error: "Not premium article" });
  // Kiểm tra số dư coin
  const credits = await prisma.ledger.aggregate({
    where: { userId, type: "credit" },
    _sum: { amount: true },
  });
  const debits = await prisma.ledger.aggregate({
    where: { userId, type: "debit" },
    _sum: { amount: true },
  });
  const coin = (credits._sum.amount || 0) - (debits._sum.amount || 0);
  if (coin < article.price)
    return res.status(400).json({ error: "Not enough coin" });
  // Trừ coin của người đọc
  await prisma.ledger.create({
    data: {
      userId,
      type: "debit",
      amount: article.price,
      ref: "unlock_article",
      createdAt: new Date(),
    },
  });
  // Chia hoa hồng 20% cho tác giả
  const authorShare = Math.floor(article.price * 0.2);
  await prisma.ledger.create({
    data: {
      userId: article.authorId,
      type: "credit",
      amount: authorShare,
      ref: "premium_royalty",
      createdAt: new Date(),
    },
  });
  // Ghi nhận quyền truy cập
  await prisma.articleUnlock.create({
    data: { articleId, userId, unlockedAt: new Date() },
  });
  res.json({ message: "Article unlocked", authorShare });
});

// GET /api/articles/:id - Get single article
router.get("/:id", async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        author: { select: { id: true, name: true, reputation: true } },
        place: { select: { id: true, name: true } },
      },
    });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json({
      code: "OK",
      message: "Article retrieved successfully",
      data: article,
    });
  } catch (err) {
    next({ code: "ERR_GET_ARTICLE", status: 500, message: err.message });
  }
});

// PUT /api/articles/:id - Update article
router.put("/:id", authenticateJWT, async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user.id;

    // Check if article exists and user is the author
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (existingArticle.authorId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this article" });
    }

    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        title: title || existingArticle.title,
        content: content || existingArticle.content,
        updatedAt: new Date(),
      },
    });

    res.json({
      code: "OK",
      message: "Article updated successfully",
      data: updatedArticle,
    });
  } catch (err) {
    next({ code: "ERR_UPDATE_ARTICLE", status: 500, message: err.message });
  }
});

// DELETE /api/articles/:id - Delete article
router.delete("/:id", authenticateJWT, async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const userId = req.user.id;

    // Check if article exists and user is the author
    const existingArticle = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      return res.status(404).json({ error: "Article not found" });
    }

    if (existingArticle.authorId !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this article" });
    }

    await prisma.article.delete({
      where: { id: articleId },
    });

    res.json({
      code: "OK",
      message: "Article deleted successfully",
    });
  } catch (err) {
    next({ code: "ERR_DELETE_ARTICLE", status: 500, message: err.message });
  }
});

// GET /api/articles - Get all articles with pagination
router.get("/", async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    if (page < 1) page = 1;
    if (limit < 1 || limit > 50) limit = 10;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [totalItems, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, reputation: true } },
          place: { select: { id: true, name: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      code: "OK",
      message: "Articles retrieved successfully",
      data: articles,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems,
      },
    });
  } catch (err) {
    next({ code: "ERR_GET_ARTICLES", status: 500, message: err.message });
  }
});

module.exports = router;
