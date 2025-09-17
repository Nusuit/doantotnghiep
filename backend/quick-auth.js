const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "rootpass",
  database: "knowledge",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const JWT_SECRET = "your-secret-key-here";

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
  return { accessToken, refreshToken };
};

// Register endpoint
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[REGISTER] Request:", {
      email: !!email,
      password: !!password,
    });

    if (!email || !password) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Email và password là bắt buộc",
      });
    }

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
    const verificationToken = Math.random().toString(36).substring(2, 15);

    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, is_email_verified, account_status, role, email_verification_token) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password_hash, false, "active", "user", verificationToken]
    );

    const userId = result.insertId;

    // Create user profile
    await pool.execute(
      `INSERT INTO user_profiles (user_id, display_name) VALUES (?, ?)`,
      [userId, displayName]
    );

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({ id: userId, email });

    console.log("[SUCCESS] User registered:", { userId, email, displayName });

    res.status(201).json({
      message: "Đăng ký thành công",
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
    console.error("[ERROR] Registration failed:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Đăng ký thất bại",
      error: error.message,
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server running" });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`[SERVER] Auth server running on port ${PORT}`);
  console.log(
    `[TEST] curl -X POST http://localhost:${PORT}/api/auth/register -H "Content-Type: application/json" -d "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"password123\\"}"`
  );
});
