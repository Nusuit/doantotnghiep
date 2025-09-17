// Load environment variables first
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mysql = require("mysql2/promise");
const { generateTokens } = require("../utils/token");
const { attachDefaultRole } = require("../utils/userRole");

// Create pool directly to avoid cache issues
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: Number(process.env.DB_PORT || 3306),
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
});

console.log("[AUTH] DB Config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  hasPassword: !!process.env.DB_PASS,
});

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

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name)
      return res
        .status(400)
        .json({ code: "BAD_REQUEST", message: "Missing fields" });

    const [exists] = await pool.query(
      "SELECT id FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (exists.length)
      return res
        .status(409)
        .json({ code: "EMAIL_EXISTS", message: "Email đã được sử dụng" });

    const password_hash = await bcrypt.hash(password, 12);
    const [ins] = await pool.execute(
      `INSERT INTO users (email, password_hash, name, is_email_verified, account_status, two_factor_enabled)
       VALUES (?,?,?,?,?,?)`,
      [email, password_hash, name, false, "active", false]
    );
    const userId = ins.insertId;

    await attachDefaultRole(userId);
    const { accessToken, refreshToken } = generateTokens({ id: userId, email });
    const expTs = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await pool.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, user_agent, ip, revoked)
       VALUES (?,?,?,?,?,?)`,
      [
        userId,
        refreshToken,
        expTs,
        req.headers["user-agent"] || null,
        req.ip || null,
        false,
      ]
    );

    res.status(201).json({
      message: "Registration successful",
      user: { id: userId, email, name },
      tokens: { accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Registration failed",
      error: error.message,
    });
  }
});

// GET /api/auth/profile (protected)
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, email, name, is_email_verified, account_status FROM users WHERE id=?",
      [req.user.id]
    );
    if (!users.length) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user: users[0] });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

module.exports = router;
