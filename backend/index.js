require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { apiRateLimiter } = require("./middleware/rateLimit");
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// Áp dụng rate limit cho toàn bộ API
app.use("/api/", apiRateLimiter);

// Route mẫu

// Import các route
app.use("/api/auth", require("./routes/auth-new"));
app.use("/api/users", require("./routes/users"));
app.use("/api/places", require("./routes/places"));
app.use("/api/restaurants", require("./routes/restaurants"));
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

// Route mẫu
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Middleware xử lý lỗi tập trung
app.use((err, req, res, next) => {
  // Chuẩn hóa lỗi
  const code = err.code || "ERR_INTERNAL";
  const status = err.status || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ success: false, code, message });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
