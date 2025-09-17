const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { generateTokens } = require("../utils/token");
const { assignDefaultRole } = require("../utils/userRole");

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

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(32),
});

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

    await assignDefaultRole(userId);
    const { accessToken, refreshToken } = generateTokens({ id: userId, email });
    const expTs = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await pool.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, user_agent, ip)
       VALUES (?,?,?,?,?)`,
      [
        userId,
        refreshToken,
        expTs,
        req.headers["user-agent"] || null,
        req.ip || null,
      ]
    );

    // Nếu muốn cookie HTTP-only (khuyên dùng), bật 3 dòng dưới và đừng trả refreshToken trong body
    // res.cookie('refreshToken', refreshToken, {
    //   httpOnly: true, sameSite: 'lax', secure: true, maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000
    // });

    return res.status(201).json({
      user: { id: userId, email, name, roles },
      accessToken,
      refreshToken, // bỏ dòng này nếu dùng cookie
      expiresIn: 15 * 60,
      tokenType: "Bearer",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: "SERVER_ERROR" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    // ...Xử lý đăng nhập
    res.json({ message: "login endpoint" });
  } catch (err) {
    next({ code: "ERR_LOGIN", status: 500, message: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res, next) => {
  try {
    // ...Xử lý đăng xuất
    res.json({ message: "logout endpoint" });
  } catch (err) {
    next({ code: "ERR_LOGOUT", status: 500, message: err.message });
  }
});

// GET /api/auth/session
router.get("/session", authenticateJWT, async (req, res, next) => {
  try {
    // Trả về thông tin user đang đăng nhập
    res.json({ user: req.user });
  } catch (err) {
    next({ code: "ERR_SESSION", status: 500, message: err.message });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: "Missing refresh token" });
  try {
    // Kiểm tra refresh token trong DB
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { jti: refreshToken },
    });
    if (!tokenRecord)
      return res.status(401).json({ error: "Invalid refresh token" });
    // Kiểm tra hạn sử dụng
    if (tokenRecord.exp < Math.floor(Date.now() / 1000))
      return res.status(401).json({ error: "Refresh token expired" });
    // Tạo access token mới
    const user = await prisma.user.findUnique({
      where: { id: tokenRecord.userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;
