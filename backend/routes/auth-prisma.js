const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { getPrisma } = require("../db/prisma");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ success: false, message: "Missing token" });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const { email, password, name, displayName } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email và password là bắt buộc" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email đã được sử dụng" });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const resolvedDisplayName =
      (displayName && String(displayName).trim()) ||
      (name && String(name).trim()) ||
      normalizedEmail.split("@")[0];

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        profile: {
          create: {
            displayName: resolvedDisplayName,
          },
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
        profile: { select: { displayName: true } },
      },
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.displayName || user.email?.split("@")[0] || "",
        role: user.role === "ADMIN" ? "admin" : "client",
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const prisma = getPrisma();
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email và password là bắt buộc" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        isEmailVerified: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
        profile: { select: { displayName: true } },
      },
    });

    if (!user || !user.passwordHash) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu không đúng" });
    }

    const token = signToken(user);

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.profile?.displayName || user.email?.split("@")[0] || "",
        role: user.role === "ADMIN" ? "admin" : "client",
        isEmailVerified: user.isEmailVerified,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma();

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
        profile: { select: { displayName: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.profile?.displayName || user.email?.split("@")[0] || "",
      role: user.role === "ADMIN" ? "admin" : "client",
      isEmailVerified: user.isEmailVerified,
      accountStatus: user.accountStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
