const express = require("express");
const router = express.Router();

// GET/POST /api/articles/:id/comments
router.get("/articles/:id/comments", async (req, res) => {
  res.json({ message: "list comments" });
});
router.post("/articles/:id/comments", async (req, res) => {
  res.json({ message: "create comment" });
});

// PUT/DELETE /api/comments/:cid
router.put("/:cid", async (req, res) => {
  const cid = req.params.cid;
  const userId = req.user?.id;
  const comment = await prisma.comment.findUnique({ where: { id: cid } });
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  // Chỉ chủ comment hoặc admin được sửa
  if (comment.userId !== userId && req.user?.role !== "admin") {
    return res.status(403).json({ error: "Not allowed" });
  }
  // ...existing code...
  res.json({ message: "update comment" });
});
router.delete("/:cid", async (req, res) => {
  const cid = req.params.cid;
  const userId = req.user?.id;
  const comment = await prisma.comment.findUnique({ where: { id: cid } });
  if (!comment) return res.status(404).json({ error: "Comment not found" });
  // Chỉ chủ comment hoặc admin được xóa
  if (comment.userId !== userId && req.user?.role !== "admin") {
    return res.status(403).json({ error: "Not allowed" });
  }
  // ...existing code...
  res.json({ message: "delete comment" });
});

// POST/DELETE /api/articles/:id/upvote
router.post("/articles/:id/upvote", async (req, res) => {
  res.json({ message: "upvote article" });
});
router.delete("/articles/:id/upvote", async (req, res) => {
  res.json({ message: "remove upvote" });
});

module.exports = router;
