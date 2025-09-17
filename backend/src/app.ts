// Entry point for Express app
import express from "express";
import authRoutes from "./routes/auth";

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Content-Length, X-Requested-With"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware để parse JSON
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Mount router cho /api/auth
app.use("/api/auth", authRoutes);

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ error: "Internal server error", message: err.message });
});

export default app;
