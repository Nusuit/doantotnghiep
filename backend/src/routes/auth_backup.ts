import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { sendVerificationEmail } from "../utils/email";
import googleOAuthService from "../services/googleOAuth";
import userService from "../services/userService";

const router = Router();

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  port: Number(process.env.DB_PORT) || 3306,
  password: process.env.DB_PASS!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
});

console.log("[AUTH-TS] DB Config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  hasPassword: !!process.env.DB_PASS,
});

// JWT middleware
const authenticateJWT = (req: any, res: Response, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// Helper functions
const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" }
  );

  const refreshToken = require("crypto").randomBytes(32).toString("hex");

  return { accessToken, refreshToken };
};

const generateResetToken = () => {
  return require("crypto").randomBytes(32).toString("hex");
};

const sendPasswordResetEmail = async (email: string, resetToken: string) => {
  // TODO: Implement actual email sending
  // For now, just log the token (in production, send via SMTP)
  console.log(
    `[EMAIL] Password reset for ${email}: http://localhost:3000/reset-password?token=${resetToken}`
  );
  return true;
};

// Function đã được move sang utils/email.ts

// Routes
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Email và password là bắt buộc",
      });
    }

    // Tự động tạo displayName từ email
    const displayName = email.split("@")[0];

    // Check if email exists
    const [exists] = (await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    )) as any;

    if (exists.length > 0) {
      return res.status(409).json({
        code: "EMAIL_EXISTS",
        message: "Email đã được sử dụng",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken = generateResetToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Check if email exists in pending_users (allow re-registration with attempt system)
    const [pendingExists] = (await pool.query(
      "SELECT id, attempts FROM pending_users WHERE email = ? LIMIT 1",
      [email]
    )) as any;

    let pendingUserId;
    let attemptCount = 1;

    if (pendingExists.length > 0) {
      // Update existing pending user with new token and increment attempts
      pendingUserId = pendingExists[0].id;
      attemptCount = (pendingExists[0].attempts || 0) + 1;

      console.log(
        `🔄 Updating existing pending user (attempt #${attemptCount})`
      );

      await pool.execute(
        `UPDATE pending_users SET 
         password_hash = ?, 
         verification_token = ?, 
         token_expires_at = ?, 
         attempts = ?,
         updated_at = NOW()
         WHERE email = ?`,
        [password_hash, verificationToken, tokenExpiresAt, attemptCount, email]
      );
    } else {
      // Create new pending user
      console.log("👤 Creating new pending user");

      const [result] = (await pool.execute(
        `INSERT INTO pending_users (email, password_hash, display_name, verification_token, token_expires_at, attempts)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          email,
          password_hash,
          displayName,
          verificationToken,
          tokenExpiresAt,
          attemptCount,
        ]
      )) as any;

      pendingUserId = result.insertId;
    }

    console.log(
      `💾 Saved to pending_users with ID: ${pendingUserId}, attempt: ${attemptCount}`
    );

    // Send verification email (REAL EMAIL)
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log(`✅ Verification email sent to ${email}`);
    } catch (emailError: any) {
      console.error("❌ Failed to send email:", emailError.message);

      // Only remove pending user if it was a new registration (attempt = 1)
      // For retry attempts, keep the user but don't increment attempt counter
      if (attemptCount === 1) {
        await pool.execute("DELETE FROM pending_users WHERE id = ?", [
          pendingUserId,
        ]);
      }

      return res.status(500).json({
        code: "EMAIL_SEND_FAILED",
        message: "Không thể gửi email xác thực. Vui lòng thử lại sau.",
        error:
          process.env.NODE_ENV === "development"
            ? emailError.message
            : undefined,
      });
    }

    res.status(201).json({
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      success: true,
      email: email,
      note: "Tài khoản sẽ được kích hoạt sau khi xác thực email.",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Đăng ký thất bại",
      error: error.message,
    });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    console.log("[LOGIN] Request body:", req.body);
    console.log("[LOGIN] Content-Type:", req.headers["content-type"]);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log(
        "[LOGIN] Missing fields - email:",
        !!email,
        "password:",
        !!password
      );
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Email và password là bắt buộc",
      });
    }

    // Find user
    const [users] = (await pool.query(
      "SELECT id, email, name, password_hash, account_status FROM users WHERE email = ? LIMIT 1",
      [email]
    )) as any;

    if (users.length === 0) {
      return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Email hoặc password không đúng",
      });
    }

    const user = users[0];

    // Check account status
    if (user.account_status !== "active") {
      return res.status(403).json({
        code: "ACCOUNT_DISABLED",
        message: "Tài khoản đã bị khóa",
      });
    }

    // Verify password
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
    const expTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Store refresh token
    await pool.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, user_agent, ip, revoked)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        refreshToken,
        expTime,
        req.headers["user-agent"] || null,
        req.ip || null,
        false,
      ]
    );

    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        account_status: user.account_status,
      },
      tokens: { accessToken, refreshToken },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Đăng nhập thất bại",
      error: error.message,
    });
  }
});

router.get("/profile", authenticateJWT, async (req: any, res: Response) => {
  try {
    const [users] = (await pool.query(
      "SELECT id, email, name, is_email_verified, account_status, created_at FROM users WHERE id = ?",
      [req.user.id]
    )) as any;

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: users[0] });
  } catch (error: any) {
    console.error("Profile error:", error);
    res.status(500).json({ error: "Failed to get profile" });
  }
});

router.post("/logout", authenticateJWT, async (req: any, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke refresh token
      await pool.execute(
        "UPDATE refresh_tokens SET revoked = 1 WHERE token = ? AND user_id = ?",
        [refreshToken, req.user.id]
      );
    }

    res.json({ message: "Đăng xuất thành công" });
  } catch (error: any) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Logout failed" });
  }
});

// Endpoint mới: Refresh token
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Refresh token là bắt buộc",
      });
    }

    // Check if refresh token exists and not revoked
    const [tokens] = (await pool.query(
      "SELECT user_id, expires_at FROM refresh_tokens WHERE token = ? AND revoked = 0 LIMIT 1",
      [refreshToken]
    )) as any;

    if (tokens.length === 0) {
      return res.status(401).json({
        code: "INVALID_TOKEN",
        message: "Refresh token không hợp lệ",
      });
    }

    const tokenData = tokens[0];

    // Check if token expired
    if (new Date() > new Date(tokenData.expires_at)) {
      return res.status(401).json({
        code: "TOKEN_EXPIRED",
        message: "Refresh token đã hết hạn",
      });
    }

    // Get user info
    const [users] = (await pool.query(
      "SELECT id, email, name FROM users WHERE id = ? AND account_status = 'active' LIMIT 1",
      [tokenData.user_id]
    )) as any;

    if (users.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = users[0];

    // Generate new tokens
    const newTokens = generateTokens(user);
    const expTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Revoke old refresh token
    await pool.execute(
      "UPDATE refresh_tokens SET revoked = 1 WHERE token = ?",
      [refreshToken]
    );

    // Store new refresh token
    await pool.execute(
      `INSERT INTO refresh_tokens (user_id, token, expires_at, revoked)
       VALUES (?, ?, ?, ?)`,
      [user.id, newTokens.refreshToken, expTime, false]
    );

    res.json({
      message: "Token đã được refresh",
      tokens: newTokens,
    });
  } catch (error: any) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Refresh token thất bại",
    });
  }
});

// Endpoint mới: Change password
router.post(
  "/change-password",
  authenticateJWT,
  async (req: any, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          code: "BAD_REQUEST",
          message: "Current password và new password là bắt buộc",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          code: "WEAK_PASSWORD",
          message: "Mật khẩu mới phải có ít nhất 8 ký tự",
        });
      }

      // Get current password hash
      const [users] = (await pool.query(
        "SELECT password_hash FROM users WHERE id = ? LIMIT 1",
        [req.user.id]
      )) as any;

      if (users.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        users[0].password_hash
      );
      if (!isValidPassword) {
        return res.status(401).json({
          code: "INVALID_CURRENT_PASSWORD",
          message: "Mật khẩu hiện tại không đúng",
        });
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
        newPasswordHash,
        req.user.id,
      ]);

      // Revoke all refresh tokens for security
      await pool.execute(
        "UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?",
        [req.user.id]
      );

      res.json({ message: "Đổi mật khẩu thành công" });
    } catch (error: any) {
      console.error("Change password error:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Đổi mật khẩu thất bại",
      });
    }
  }
);

// Endpoint mới: Get all users (admin only)
router.get("/users", authenticateJWT, async (req: any, res: Response) => {
  try {
    // Check if user has admin role
    const [userRoles] = (await pool.query(
      "SELECT r.key FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?",
      [req.user.id]
    )) as any;

    const roles = userRoles.map((r: any) => r.key);
    if (!roles.includes("admin")) {
      return res.status(403).json({
        code: "FORBIDDEN",
        message: "Chỉ admin mới có quyền truy cập",
      });
    }

    // Get all users
    const [users] = (await pool.query(
      "SELECT id, email, name, is_email_verified, account_status, created_at FROM users ORDER BY created_at DESC"
    )) as any;

    res.json({ users });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Email là bắt buộc",
      });
    }

    // Check if user exists
    const [users] = (await pool.query(
      "SELECT id, email FROM users WHERE email = ? AND account_status = 'active' LIMIT 1",
      [email]
    )) as any;

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      return res.json({
        message: "Nếu email tồn tại, chúng tôi đã gửi link reset password",
      });
    }

    const user = users[0];
    const resetToken = generateResetToken();
    const expTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete old reset tokens
    await pool.execute("DELETE FROM password_resets WHERE user_id = ?", [
      user.id,
    ]);

    // Store reset token
    await pool.execute(
      `INSERT INTO password_resets (user_id, token, expires_at, used)
       VALUES (?, ?, ?, ?)`,
      [user.id, resetToken, expTime, false]
    );

    // Send email (mock)
    await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      message: "Nếu email tồn tại, chúng tôi đã gửi link reset password",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Gửi email reset thất bại",
    });
  }
});

// Reset Password
router.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Token và new password là bắt buộc",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        code: "WEAK_PASSWORD",
        message: "Mật khẩu phải có ít nhất 8 ký tự",
      });
    }

    // Find valid reset token
    const [resets] = (await pool.query(
      `SELECT pr.user_id, pr.expires_at, u.email 
       FROM password_resets pr 
       JOIN users u ON pr.user_id = u.id 
       WHERE pr.token = ? AND pr.used = 0 AND u.account_status = 'active' 
       LIMIT 1`,
      [token]
    )) as any;

    if (resets.length === 0) {
      return res.status(400).json({
        code: "INVALID_TOKEN",
        message: "Token reset không hợp lệ hoặc đã được sử dụng",
      });
    }

    const resetData = resets[0];

    // Check if token expired
    if (new Date() > new Date(resetData.expires_at)) {
      return res.status(400).json({
        code: "TOKEN_EXPIRED",
        message: "Token reset đã hết hạn",
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
      passwordHash,
      resetData.user_id,
    ]);

    // Mark token as used
    await pool.execute("UPDATE password_resets SET used = 1 WHERE token = ?", [
      token,
    ]);

    // Revoke all refresh tokens for security
    await pool.execute(
      "UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?",
      [resetData.user_id]
    );

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error: any) {
    console.error("Reset password error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Reset mật khẩu thất bại",
    });
  }
});

// Verify Reset Token (check if token is valid)
router.get(
  "/verify-reset-token/:token",
  async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const [resets] = (await pool.query(
        `SELECT expires_at FROM password_resets 
       WHERE token = ? AND used = 0 LIMIT 1`,
        [token]
      )) as any;

      if (resets.length === 0) {
        return res.status(400).json({
          code: "INVALID_TOKEN",
          message: "Token không hợp lệ",
          valid: false,
        });
      }

      const isExpired = new Date() > new Date(resets[0].expires_at);

      res.json({
        valid: !isExpired,
        message: isExpired ? "Token đã hết hạn" : "Token hợp lệ",
      });
    } catch (error: any) {
      console.error("Verify reset token error:", error);
      res.status(500).json({ error: "Verification failed" });
    }
  }
);

// Send Email Verification
router.post(
  "/send-verification-email",
  authenticateJWT,
  async (req: any, res: Response) => {
    try {
      const userId = req.user.id;

      // Get user info
      const [users] = (await pool.query(
        "SELECT email, is_email_verified FROM users WHERE id = ? LIMIT 1",
        [userId]
      )) as any;

      if (users.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = users[0];

      if (user.is_email_verified) {
        return res.status(400).json({
          code: "ALREADY_VERIFIED",
          message: "Email đã được xác thực",
        });
      }

      const verificationToken = generateResetToken();
      const expTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Delete old verification tokens
      await pool.execute("DELETE FROM email_verifications WHERE user_id = ?", [
        userId,
      ]);

      // Store verification token
      await pool.execute(
        `INSERT INTO email_verifications (user_id, token, expires_at, used)
       VALUES (?, ?, ?, ?)`,
        [userId, verificationToken, expTime, false]
      );

      // Send email
      await sendVerificationEmail(user.email, verificationToken);

      res.json({
        message: "Email xác thực đã được gửi",
      });
    } catch (error: any) {
      console.error("Send verification email error:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Gửi email xác thực thất bại",
      });
    }
  }
);

// Verify Email
router.post("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Token là bắt buộc",
      });
    }

    // Find valid verification token
    const [verifications] = (await pool.query(
      `SELECT ev.user_id, ev.expires_at, u.email 
       FROM email_verifications ev 
       JOIN users u ON ev.user_id = u.id 
       WHERE ev.token = ? AND ev.used = 0 
       LIMIT 1`,
      [token]
    )) as any;

    if (verifications.length === 0) {
      return res.status(400).json({
        code: "INVALID_TOKEN",
        message: "Token xác thực không hợp lệ hoặc đã được sử dụng",
      });
    }

    const verificationData = verifications[0];

    // Check if token expired
    if (new Date() > new Date(verificationData.expires_at)) {
      return res.status(400).json({
        code: "TOKEN_EXPIRED",
        message: "Token xác thực đã hết hạn",
      });
    }

    // Update user email verification status
    await pool.execute("UPDATE users SET is_email_verified = 1 WHERE id = ?", [
      verificationData.user_id,
    ]);

    // Mark token as used
    await pool.execute(
      "UPDATE email_verifications SET used = 1 WHERE token = ?",
      [token]
    );

    res.json({
      message: "Email đã được xác thực thành công",
    });
  } catch (error: any) {
    console.error("Verify email error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Xác thực email thất bại",
    });
  }
});

// Resend Email Verification (public endpoint)
router.post("/resend-verification", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Email là bắt buộc",
      });
    }

    // Find user
    const [users] = (await pool.query(
      "SELECT id, email, is_email_verified FROM users WHERE email = ? AND account_status = 'active' LIMIT 1",
      [email]
    )) as any;

    if (users.length === 0) {
      // Don't reveal if email exists
      return res.json({
        message:
          "Nếu email tồn tại và chưa xác thực, chúng tôi đã gửi lại email xác thực",
      });
    }

    const user = users[0];

    if (user.is_email_verified) {
      return res.json({
        message: "Email đã được xác thực",
      });
    }

    const verificationToken = generateResetToken();
    const expTime = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Delete old verification tokens
    await pool.execute("DELETE FROM email_verifications WHERE user_id = ?", [
      user.id,
    ]);

    // Store new verification token
    await pool.execute(
      `INSERT INTO email_verifications (user_id, token, expires_at, used)
       VALUES (?, ?, ?, ?)`,
      [user.id, verificationToken, expTime, false]
    );

    // Send email
    await sendVerificationEmail(user.email, verificationToken);

    res.json({
      message:
        "Nếu email tồn tại và chưa xác thực, chúng tôi đã gửi lại email xác thực",
    });
  } catch (error: any) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Gửi lại email xác thực thất bại",
    });
  }
});

// Email verification endpoint
router.get("/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    console.log("[VERIFY] Token received:", token);

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Token xác thực không hợp lệ",
      });
    }

    // Tìm user với token
    const [users] = (await pool.query(
      "SELECT id, email FROM users WHERE email_verification_token = ? AND is_email_verified = false",
      [token]
    )) as any;

    if (users.length === 0) {
      return res.status(400).json({
        code: "INVALID_TOKEN",
        message: "Token không hợp lệ hoặc đã được sử dụng",
      });
    }

    const user = users[0];

    // Cập nhật user đã verify
    await pool.execute(
      "UPDATE users SET is_email_verified = true, email_verification_token = NULL WHERE email_verification_token = ?",
      [token]
    );

    console.log("[VERIFY] Success:", { userId: user.id, email: user.email });

    res.status(200).json({
      message: "Email đã được xác thực thành công!",
      success: true,
      user: {
        id: user.id,
        email: user.email,
        is_email_verified: true,
      },
    });
  } catch (error: any) {
    console.error("Email verification error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Lỗi xác thực email",
      error: error.message,
    });
  }
});

// =============================================================================
// GOOGLE OAUTH ROUTES
// =============================================================================

// GET /api/auth/google - Initialize Google OAuth flow
router.get("/google", (req: Request, res: Response) => {
  try {
    console.log("🔍 Google OAuth endpoint called");

    res.json({
      success: true,
      message: "Google OAuth endpoint is working",
      configured: false,
      note: "This is a test response",
    });
  } catch (error: any) {
    console.error("Google OAuth URL generation error:", error);
    res.status(500).json({
      code: "OAUTH_ERROR",
      message: "Không thể tạo Google OAuth URL",
      error: error.message,
    });
  }
});

export default router;
  try {
    const { code, error: oauthError } = req.query;

    // Check for OAuth error
    if (oauthError) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=oauth_cancelled`);
    }

    // Check for authorization code
    if (!code || typeof code !== "string") {
      return res.redirect(`${process.env.FRONTEND_URL}?error=no_code`);
    }

    console.log("🔑 Exchanging code for tokens...");

    // Exchange code for tokens
    const tokens = await googleOAuthService.getTokens(code);

    if (!tokens.access_token) {
      throw new Error("No access token received");
    }

    console.log("📋 Getting user info from Google...");

    // Get user info from Google
    const googleProfile = await googleOAuthService.getUserInfo(
      tokens.access_token
    );

    if (!googleProfile.email) {
      throw new Error("No email received from Google");
    }

    console.log(
      `👤 Google user: ${googleProfile.email} (${googleProfile.name})`
    );

    // Process user authentication (create/update user)
    const { user, isNewUser } = await userService.processGoogleAuth(
      googleProfile
    );

    // Update last login
    await userService.updateLastLogin(user.id);

    // Generate JWT token
    const jwtToken = userService.generateToken(user);

    console.log(
      `✅ ${isNewUser ? "Created new" : "Logged in existing"} user: ${
        user.email
      }`
    );

    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL}?token=${jwtToken}&new_user=${isNewUser}`;
    res.redirect(redirectUrl);
  } catch (error: any) {
    console.error("❌ Google OAuth callback error:", error);
    const errorUrl = `${
      process.env.FRONTEND_URL
    }?error=oauth_failed&message=${encodeURIComponent(error.message)}`;
    res.redirect(errorUrl);
  }
});

// POST /api/auth/google/token - Alternative token-based flow
router.post("/google/token", async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        code: "MISSING_TOKEN",
        message: "ID token is required",
      });
    }

    console.log("🔍 Verifying Google ID token...");

    // Verify ID token
    const googleProfile = await googleOAuthService.verifyIdToken(idToken);

    if (!googleProfile) {
      return res.status(401).json({
        code: "INVALID_TOKEN",
        message: "Invalid Google ID token",
      });
    }

    console.log(
      `👤 Google user verified: ${googleProfile.email} (${googleProfile.name})`
    );

    // Process user authentication
    const { user, isNewUser } = await userService.processGoogleAuth(
      googleProfile
    );

    // Update last login
    await userService.updateLastLogin(user.id);

    // Generate JWT token
    const jwtToken = userService.generateToken(user);

    console.log(
      `✅ ${isNewUser ? "Created new" : "Logged in existing"} user: ${
        user.email
      }`
    );

    // Return token and user data
    res.status(200).json({
      success: true,
      message: isNewUser
        ? "Tài khoản đã được tạo thành công"
        : "Đăng nhập thành công",
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.full_name,
        given_name: user.given_name,
        family_name: user.family_name,
        profile_picture: user.profile_picture,
        locale: user.locale,
        auth_provider: user.auth_provider,
        is_email_verified: user.is_email_verified,
      },
      isNewUser,
    });
  } catch (error: any) {
    console.error("❌ Google token verification error:", error);
    res.status(500).json({
      code: "OAUTH_ERROR",
      message: "Không thể xác thực tài khoản Google",
      error: error.message,
    });
  }
});

export default router;
