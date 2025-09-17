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

// GET /api/notifications
router.get("/", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ notifications });
});

// POST /api/notifications/read
router.post("/read", authenticateJWT, async (req, res) => {
  const userId = req.user.id;
  const { upToId } = req.body;
  await prisma.notification.updateMany({
    where: { userId, id: { lte: upToId } },
    data: { read: true },
  });
  res.json({ message: "Notifications marked as read" });
});

module.exports = router;
