const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../db");
const { generateTokens } = require("../utils/token");
const { assignDefaultRole } = require("../utils/userRole");
const crypto = require("crypto");

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
    const { email, password } = req.body || {};
    if (!email || !password)
      return res
        .status(400)
        .json({ code: "BAD_REQUEST", message: "Missing required fields" });

    // Check if email exists
    const [emailExists] = await pool.query(
      "SELECT id FROM users WHERE email=? LIMIT 1",
      [email]
    );
    if (emailExists.length)
      return res
        .status(409)
        .json({ code: "EMAIL_EXISTS", message: "Email đã được sử dụng" });

    const password_hash = await bcrypt.hash(password, 12);
    const [ins] = await pool.execute(
      `INSERT INTO users (email, password_hash, name, is_email_verified, account_status, two_factor_enabled)
       VALUES (?,?,?,?,?,?)`,
      [email, password_hash, email.split("@")[0], false, "active", false]
    );
    const userId = ins.insertId;

    await assignDefaultRole(userId);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await pool.execute(
      `INSERT INTO email_verifications (user_id, token, expires_at)
       VALUES (?,?,?)`,
      [userId, verificationToken, expiresAt]
    );

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for verification.",
      user: { id: userId, email, is_email_verified: false },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Registration failed",
      error: error.message,
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });

    // Find user by email
    const [users] = await pool.query(
      "SELECT id, email, password_hash, is_email_verified, account_status FROM users WHERE email=? LIMIT 1",
      [email]
    );

    if (!users.length) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Check account status
    if (user.account_status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
      id: user.id,
      email: user.email,
    });
    const expTs = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Save refresh token
    await pool.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, user_agent, ip, revoked)
       VALUES (?,?,?,?,?,?)`,
      [
        user.id,
        refreshToken,
        expTs,
        req.headers["user-agent"] || null,
        req.ip || null,
        false,
      ]
    );

    // Update last login
    await pool.execute(
      "UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id]
    );

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        is_email_verified: user.is_email_verified,
      },
      token: accessToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    // Find user by email
    const [users] = await pool.query(
      "SELECT id FROM users WHERE email=? LIMIT 1",
      [email]
    );

    // Always return success to prevent email enumeration
    if (!users.length) {
      return res.json({
        success: true,
        message:
          "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
      });
    }

    const user = users[0];

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await pool.execute(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES (?,?,?)`,
      [user.id, resetToken, expiresAt]
    );

    // TODO: Send email with reset link
    // For now, just return success
    res.json({
      success: true,
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process forgot password request",
    });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password)
      return res
        .status(400)
        .json({ success: false, message: "Token and password are required" });

    // Find valid reset token
    const [resets] = await pool.query(
      "SELECT user_id FROM password_resets WHERE token=? AND expires_at > NOW() AND used_at IS NULL LIMIT 1",
      [token]
    );

    if (!resets.length) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    const userId = resets[0].user_id;

    // Hash new password
    const password_hash = await bcrypt.hash(password, 12);

    // Update password
    await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
      password_hash,
      userId,
    ]);

    // Mark token as used
    await pool.execute(
      "UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE token = ?",
      [token]
    );

    // Revoke all refresh tokens for this user
    await pool.execute(
      "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?",
      [userId]
    );

    res.json({
      success: true,
      message: "Mật khẩu đã được đặt lại thành công",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token)
      return res
        .status(400)
        .json({ success: false, message: "Token is required" });

    // Find valid verification token
    const [verifications] = await pool.query(
      "SELECT user_id FROM email_verifications WHERE token=? AND expires_at > NOW() AND used_at IS NULL LIMIT 1",
      [token]
    );

    if (!verifications.length) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    const userId = verifications[0].user_id;

    // Mark email as verified
    await pool.execute(
      "UPDATE users SET is_email_verified = TRUE WHERE id = ?",
      [userId]
    );

    // Mark token as used
    await pool.execute(
      "UPDATE email_verifications SET used_at = CURRENT_TIMESTAMP WHERE token = ?",
      [token]
    );

    res.json({
      success: true,
      message: "Email đã được xác minh thành công",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify email",
    });
  }
});

// POST /api/auth/logout
router.post("/logout", authenticateJWT, async (req, res) => {
  try {
    const { refreshToken } = req.body || {};

    if (refreshToken) {
      // Revoke specific refresh token
      await pool.execute(
        "UPDATE refresh_tokens SET revoked = TRUE WHERE token = ? AND user_id = ?",
        [refreshToken, req.user.id]
      );
    } else {
      // Revoke all refresh tokens for this user
      await pool.execute(
        "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = ?",
        [req.user.id]
      );
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
});

// GET /api/auth/profile (protected)
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    // Query from users table joined with user_profiles
    const [users] = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.given_name, u.family_name, u.profile_picture, 
              u.is_email_verified, u.account_status, u.auth_provider, u.created_at,
              up.first_name as firstName, up.last_name as lastName, up.display_name as displayName,
              up.birth_date as dateOfBirth, up.gender, up.phone_number as phoneNumber, 
              up.country, up.address, up.bio, up.avatar_url,
              up.is_profile_public,
              -- Profile completion logic
              CASE 
                WHEN up.user_id IS NOT NULL AND up.first_name IS NOT NULL AND up.last_name IS NOT NULL 
                THEN true 
                ELSE false 
              END as profileComplete,
              CASE 
                WHEN up.user_id IS NOT NULL 
                THEN true 
                ELSE false 
              END as isProfileSetup,
              -- Use displayName from profile or fallback to full_name or email
              COALESCE(up.display_name, u.full_name, SUBSTRING_INDEX(u.email, '@', 1)) as fullName
       FROM users u 
       LEFT JOIN user_profiles up ON u.id = up.user_id 
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (!users.length) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = users[0];

    // Parse JSON fields if they exist (foodPreferences stored in JSON format)
    let foodPreferences = {};
    // Note: foodPreferences not in current user_profiles schema, keeping empty for now

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        given_name: user.given_name,
        family_name: user.family_name,
        profile_picture: user.profile_picture || user.avatar_url,
        is_email_verified: user.is_email_verified,
        account_status: user.account_status,
        auth_provider: user.auth_provider,
        created_at: user.created_at,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        country: user.country,
        address: user.address,
        bio: user.bio,
        avatar_url: user.avatar_url,
        foodPreferences: foodPreferences,
        priceRange: null, // Not in current schema
        preferredLocation: null, // Not in current schema
        isProfileSetup: Boolean(user.isProfileSetup),
        profileComplete: Boolean(user.profileComplete),
        is_profile_public: Boolean(user.is_profile_public),
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, error: "Failed to get profile" });
  }
});

// GET /api/auth/google
router.get("/google", async (req, res) => {
  try {
    // For now, return a placeholder response
    // TODO: Implement actual Google OAuth flow
    res.json({
      success: true,
      message: "Google OAuth endpoint - not yet implemented",
      authUrl:
        "https://accounts.google.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=email%20profile&response_type=code",
    });
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
