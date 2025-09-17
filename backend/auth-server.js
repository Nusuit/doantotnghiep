const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Database connection - SỬ DỤNG MẬT KHẨU THỰC CỦA BẠN
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASS,
  database: "knowledge",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    process.exit(1);
  }
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// Generate tokens
const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
  return { accessToken, refreshToken };
};

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("[REGISTER] Request received:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Email và password là bắt buộc",
      });
    }

    // Auto-generate displayName from email
    const displayName = email.split("@")[0];

    // Check if email exists
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (exists.length > 0) {
      return res.status(409).json({
        code: "EMAIL_EXISTS",
        message: "Email đã được sử dụng",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, is_email_verified, account_status, role, email_verification_token)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password_hash, false, "active", "user", verificationToken]
    );

    const userId = result.insertId;

    // Create user profile
    await pool.execute(
      `INSERT INTO user_profiles (user_id, display_name)
       VALUES (?, ?)`,
      [userId, displayName]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({ id: userId, email });

    console.log("[REGISTER] Success:", { userId, email, displayName });

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        id: userId,
        email,
        name: displayName,
        is_email_verified: false,
        account_status: "active",
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Đăng ký thất bại",
      error: error.message,
    });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Email và password là bắt buộc",
      });
    }

    // Find user
    const [users] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Email hoặc password không đúng",
      });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Email hoặc password không đúng",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        name: displayName,
        is_email_verified: user.is_email_verified,
        account_status: user.account_status,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Đăng nhập thất bại",
      error: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Auth Server Running",
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 4000;

async function startServer() {
  await testConnection(); // Test DB first

  app.listen(PORT, () => {
    console.log(`🚀 [AUTH-SERVER] Running on http://localhost:${PORT}`);
    console.log(`📝 Register: POST http://localhost:${PORT}/api/auth/register`);
    console.log(`🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`❤️  Health: GET http://localhost:${PORT}/api/health`);
  });
}

startServer().catch(console.error);
