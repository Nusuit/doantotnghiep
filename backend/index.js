require("dotenv").config();
const { loadEnv } = require("./config/env");
const express = require("express");
const cors = require("cors");
const app = express();
const { apiRateLimiter } = require("./middleware/rateLimit");
const { requestContext } = require("./middleware/requestContext");
const { getPrisma } = require("./db/prisma");

// Fail fast on missing/invalid env (better for production)
const env = loadEnv(process.env);
const PORT = env.PORT;

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  })
);
app.use(requestContext());
app.use(express.json({ limit: "1mb" }));
// Áp dụng rate limit cho toàn bộ API
app.use("/api/", apiRateLimiter);

// Route mẫu

// ===== Stable MVP routes (production-first) =====
// Auth: Prisma/Postgres implementation
app.use("/api/auth", require("./routes/auth-prisma"));

// Restaurants: used by frontend Map page
app.use("/api/restaurants", require("./routes/restaurants"));

// ===== Legacy/experimental routes (kept, but OFF by default) =====
// Enable by setting ENABLE_LEGACY_ROUTES=true
if (String(process.env.ENABLE_LEGACY_ROUTES || "").toLowerCase() === "true") {
  app.use("/api/auth-legacy", require("./routes/auth-new"));
  app.use("/api/users", require("./routes/users"));
  app.use("/api/places", require("./routes/places"));
  app.use("/api/articles", require("./routes/articles"));
  app.use("/api/suggestions", require("./routes/suggestions"));
  app.use("/api/comments", require("./routes/comments"));
  app.use("/api/wallet", require("./routes/wallet"));
  app.use("/api/holds", require("./routes/holds"));
  app.use("/api/quests", require("./routes/quests"));
  app.use("/api/search", require("./routes/search"));
  app.use("/api/notifications", require("./routes/notifications"));
  app.use("/api/ai", require("./routes/ai"));
  app.use("/api/notes", require("./routes/notes"));
  app.use("/api/geo", require("./routes/geo"));
  app.use("/api/admin", require("./routes/admin"));
  app.use("/api/chatbot", require("./routes/chatbot"));
  app.use("/api/map", require("./routes/map"));
}

// Route mẫu
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Readiness: checks DB connectivity (useful for Docker/K8s)
app.get("/api/ready", async (req, res) => {
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (err) {
    res.status(503).json({ status: "degraded" });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: "ERR_NOT_FOUND",
    message: "Not found",
    requestId: req.requestId,
  });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  // Chuẩn hóa lỗi
  const code = err.code || "ERR_INTERNAL";
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({
    success: false,
    code,
    message,
    requestId: req.requestId,
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
