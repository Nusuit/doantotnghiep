import express from "express";
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { sendVerificationEmail } from "./src/utils/email";
import "dotenv/config";

const app = express();
const router = Router();

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

app.use(express.json());

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

console.log("[MINIMAL-AUTH] DB Config:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  db: process.env.DB_NAME,
  hasPassword: !!process.env.DB_PASS,
});

// Helper function
const generateResetToken = () => {
  return require("crypto").randomBytes(32).toString("hex");
};

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Simple registration endpoint
app.post("/api/auth/register", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("📥 Registration request:", { email, hasPassword: !!password });

    if (!email || !password) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Email và password là bắt buộc",
      });
    }

    // Tự động tạo displayName từ email
    const displayName = email.split("@")[0];

    // Check if email exists in main users table
    const [exists] = (await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    )) as any;

    if (exists.length > 0) {
      return res.status(409).json({
        code: "EMAIL_EXISTS",
        message: "Email đã được sử dụng trong hệ thống",
      });
    }

    console.log("✅ Email available, proceeding with registration");

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Generate email verification token
    const verificationToken = generateResetToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log("🔐 Password hashed and token generated");

    // Check if email exists in pending_users (allow re-registration)
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

    // Send verification email
    try {
      console.log("📧 Attempting to send verification email...");
      await sendVerificationEmail(email, verificationToken);
      console.log(`✅ Verification email sent successfully to ${email}`);
    } catch (emailError: any) {
      console.error("❌ Failed to send email:", emailError.message);

      // Don't delete pending user on email failure (keep for retry)
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
    console.error("❌ Registration error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Đăng ký thất bại",
      error: error.message,
    });
  }
});

// Email verification endpoint
app.post("/api/auth/verify-email", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    console.log("📧 Email verification request:", { token });

    if (!token) {
      return res.status(400).json({
        code: "BAD_REQUEST",
        message: "Token xác thực là bắt buộc",
      });
    }

    // Find pending user by token
    const [pendingUsers] = (await pool.query(
      "SELECT * FROM pending_users WHERE verification_token = ? AND token_expires_at > NOW() LIMIT 1",
      [token]
    )) as any;

    if (pendingUsers.length === 0) {
      return res.status(400).json({
        code: "INVALID_TOKEN",
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    const pendingUser = pendingUsers[0];
    console.log("✅ Found pending user:", pendingUser.email);

    // Check if email already exists in main users table
    const [existingUsers] = (await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [pendingUser.email]
    )) as any;

    if (existingUsers.length > 0) {
      // Clean up pending user and return error
      await pool.execute("DELETE FROM pending_users WHERE id = ?", [
        pendingUser.id,
      ]);
      return res.status(409).json({
        code: "EMAIL_EXISTS",
        message: "Email đã được sử dụng",
      });
    }

    // Move user from pending_users to users
    const [userResult] = (await pool.execute(
      `INSERT INTO users (email, password_hash, is_email_verified, created_at, updated_at)
       VALUES (?, ?, TRUE, NOW(), NOW())`,
      [pendingUser.email, pendingUser.password_hash]
    )) as any;

    const userId = userResult.insertId;
    console.log(`👤 Created user with ID: ${userId}`);

    // Create user profile
    await pool.execute(
      `INSERT INTO user_profiles (user_id, display_name, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [userId, pendingUser.display_name]
    );

    console.log("👤 Created user profile");

    // Clean up pending user
    await pool.execute("DELETE FROM pending_users WHERE id = ?", [
      pendingUser.id,
    ]);

    console.log("🗑️ Cleaned up pending user");

    res.status(200).json({
      message: "Xác thực email thành công! Tài khoản đã được kích hoạt.",
      success: true,
      email: pendingUser.email,
      userId: userId,
    });
  } catch (error: any) {
    console.error("❌ Email verification error:", error);
    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Xác thực email thất bại",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
});
