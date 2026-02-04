import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { getPrisma } from "../db/prisma";
import { authenticate } from "../middleware/auth";
import { loadEnv } from "../config/env";
import { sendEmail } from "../utils/email";
import { redis } from "../modules/redis";
import { sendError, sendSuccess } from "../utils/response";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+84\d{9,10}$/, "Số điện thoại không hợp lệ. Định dạng: +84xxxxxxxxx"),
});

const verifyOtpSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+84\d{9,10}$/, "Số điện thoại không hợp lệ. Định dạng: +84xxxxxxxxx"),
  otpCode: z.string().regex(/^\d{6}$/, "Mã OTP không hợp lệ"),
});



function signJwt(payload: Record<string, any>, expiresIn: jwt.SignOptions["expiresIn"]) {
  const { JWT_SECRET: secret } = loadEnv(process.env);
  return jwt.sign(payload, secret, { expiresIn });
}

function signToken(payload: { id: number; email: string }) {
  return signJwt(payload, "7d");
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateEmailToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generateRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

function setAuthCookies(res: any, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === "production";
  const cookieBase = {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
  };

  res.cookie("access_token", accessToken, { ...cookieBase, maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refreshToken, { ...cookieBase, maxAge: 30 * 24 * 60 * 60 * 1000 });

  const csrfToken = crypto.randomBytes(16).toString("hex");
  res.cookie("csrf_token", csrfToken, {
    httpOnly: false,
    secure: isProd,
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return csrfToken;
}

function clearAuthCookies(res: any) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
  res.clearCookie("csrf_token", { path: "/" });
}

// function splitFullName(fullName: string) { ... } -> Moved to utils/text.ts


function getRequestIp(req: any) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip;
}

function isCsrfValid(req: any) {
  const csrfToken = req.cookies?.csrf_token;
  const csrfHeader = req.header("x-csrf-token");
  return Boolean(csrfToken && csrfHeader && csrfToken === csrfHeader);
}

export function createAuthRouter() {
  const router = Router();

  // Phone OTP auth (frontend: /auth, /auth/register)
  router.post("/send-otp", async (req, res) => {
    return sendError(
      req,
      res,
      410,
      "PHONE_OTP_DISABLED",
      "Phone OTP has been disabled. Please use email-based authentication."
    );
  });

  router.post("/resend-otp", async (req, res) => {
    return sendError(
      req,
      res,
      410,
      "PHONE_OTP_DISABLED",
      "Phone OTP has been disabled. Please use email-based authentication."
    );
  });

  router.post("/verify-otp", async (req, res) => {
    return sendError(
      req,
      res,
      410,
      "PHONE_OTP_DISABLED",
      "Phone OTP has been disabled. Please use email-based authentication."
    );
  });

  router.get("/google", async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const scope = process.env.GOOGLE_SCOPE || "email profile openid";
    if (!clientId || !redirectUri) {
      return sendError(req, res, 400, "ERR_GOOGLE_OAUTH", "Google OAuth chưa được cấu hình");
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope,
      access_type: "offline",
      prompt: "consent",
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return sendSuccess(req, res, { authUrl });
  });

  router.get("/google/callback", async (req, res, next) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== "string") {
        return sendError(req, res, 400, "ERR_VALIDATION", "Missing code");
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI;

      if (!clientId || !clientSecret || !redirectUri) {
        return sendError(req, res, 500, "ERR_CONFIG", "Server misconfigured for Google OAuth");
      }

      // 1. Exchange code for tokens
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json() as any;
      if (!tokenRes.ok) {
        console.error("Google Token Error:", tokenData);
        return sendError(req, res, 401, "ERR_GOOGLE_TOKEN", "Failed to exchange token with Google");
      }

      const { id_token, access_token } = tokenData;

      // 2. Get User Info
      const userRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
        headers: { Authorization: `Bearer ${id_token}` },
      });
      const userData = await userRes.json() as any;
      if (!userRes.ok) {
        return sendError(req, res, 401, "ERR_GOOGLE_USER", "Failed to get user info");
      }

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

      // 3. Find or Create User
      const prisma = getPrisma() as any;
      const email = userData.email.toLowerCase();
      let isNewUser = false;

      let user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true }
      });

      if (!user) {
        isNewUser = true;
        // Create new user (Auto-verified)
        const displayName = userData.name || userData.given_name || "Google User";
        const randomPassword = crypto.randomBytes(16).toString("hex");
        const passwordHash = await bcrypt.hash(randomPassword, 12);

        user = await prisma.user.create({
          data: {
            email,
            passwordHash,
            isEmailVerified: true,
            accountStatus: "ACTIVE",
            role: "USER",
            profile: {
              create: {
                displayName,
                avatarUrl: userData.picture,
              },
            },
          },
          include: { profile: true }
        });
      } else {
        if (user.accountStatus === "PENDING_VERIFY") {
          await prisma.user.update({
            where: { id: user.id },
            data: { accountStatus: "ACTIVE", isEmailVerified: true }
          });
        }
      }

      if (["INACTIVE", "SUSPENDED", "BANNED"].includes(user.accountStatus)) {
        return res.redirect(`${frontendUrl}/auth?error=ACCOUNT_LOCKED`);
      }

      // 4. Issue App Tokens
      const newAccessToken = signToken({ id: user.id, email: user.email });
      const newRefreshToken = generateRefreshToken();
      const refreshHash = hashToken(newRefreshToken);

      const userAgent = req.get("user-agent") || "unknown";
      const ipAddress = getRequestIp(req);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refreshHash,
          userAgent,
          ipAddress,
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      setAuthCookies(res, newAccessToken, newRefreshToken);

      // 5. Redirect to Frontend with Success Flag
      const redirectUrl = isNewUser
        ? `${frontendUrl}/app/onboarding?welcome=google`
        : `${frontendUrl}/app/feed?welcome=back`;

      console.log("---------------------------------------------------");
      console.log("GOOGLE LOGIN SUCCESS");
      console.log("User Email:", email);
      console.log("Is New User:", isNewUser);
      console.log("Redirecting to:", redirectUrl);
      console.log("---------------------------------------------------");

      return res.redirect(redirectUrl);

    } catch (err: any) {
      console.error("Google Auth Error:", err);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
      return res.redirect(`${frontendUrl}/auth?error=SERVER_ERROR`);
    }
  });



  router.post("/send-verification-email", authenticate, async (req, res, next) => {
    try {
      const prisma = getPrisma() as any;
      const userId = Number((req as any).user?.id);
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          isEmailVerified: true,
          emailOtpAttempts: true,
          emailOtpLastSentAt: true,
          emailOtpLockedUntil: true,
        }
      });

      if (!user) return sendError(req, res, 404, "ERR_NOT_FOUND", "User not found");
      if (user.isEmailVerified) return sendError(req, res, 400, "ERR_VALIDATION", "Email already verified");

      const now = new Date();
      if (user.emailOtpLockedUntil && user.emailOtpLockedUntil > now) {
        return sendError(req, res, 429, "ERR_RATE_LIMIT", "Too many attempts. Try again later.");
      }

      const cooldownSeconds = Number(process.env.EMAIL_OTP_COOLDOWN_SECONDS || 90);
      if (user.emailOtpLastSentAt) {
        const elapsedMs = now.getTime() - new Date(user.emailOtpLastSentAt).getTime();
        if (elapsedMs < cooldownSeconds * 1000) {
          return sendError(req, res, 429, "ERR_RATE_LIMIT", "Please wait before requesting another code.");
        }
      }

      const token = generateEmailToken();
      const tokenHash = hashToken(token);
      const expiryMinutes = Number(process.env.EMAIL_VERIFICATION_EXPIRY_MINUTES || 30);
      const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      await prisma.user.update({
        where: { id: userId },
        data: {
          emailVerificationToken: tokenHash,
          emailVerificationExpiresAt: expiresAt,
          emailOtpAttempts: 0,
          emailOtpLastSentAt: now,
          emailOtpLockedUntil: null,
        }
      });

      const link = `http://localhost:2803/verify-email?token=${token}&email=${user.email}`;
      await sendEmail(user.email!, "Verify your email", `Click here to verify: ${link}`);

      return sendSuccess(req, res, { message: "Verification email sent" });
    } catch (err) { next(err); }
  });

  router.post("/verify-email", async (req, res, next) => {
    try {
      const { email, token } = req.body;
      if (!email || !token) return sendError(req, res, 400, "ERR_VALIDATION", "Missing email or token");

      const prisma = getPrisma() as any;
      const tokenHash = hashToken(token);
      const user = await prisma.user.findFirst({
        where: { email, emailVerificationToken: tokenHash }
      });

      if (!user) return sendError(req, res, 400, "ERR_VALIDATION", "Invalid token");
      if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt < new Date()) {
        return sendError(req, res, 400, "ERR_EXPIRED", "Token expired");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpiresAt: null }
      });

      return sendSuccess(req, res, { message: "Email verified successfully" });
    } catch (err) { next(err); }
  });

  router.post("/register", async (req, res, next) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const prisma = getPrisma() as any;
      const email = parsed.data.email.toLowerCase();

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return sendError(req, res, 409, "ERR_CONFLICT", "Email already exists");

      const passwordHash = await bcrypt.hash(parsed.data.password, 12);
      const displayName = (parsed.data.displayName || parsed.data.name || "User").trim();

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          isEmailVerified: false,
          accountStatus: "PENDING_VERIFY",
          role: "USER",
          profile: {
            create: { displayName },
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          accountStatus: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
          profile: { select: { displayName: true } },
        },
      });

      // OTP Flow: Generate 6-digit code
      const otpCode = generateOtpCode();
      const otpHash = hashToken(otpCode);
      const expiryMinutes = Number(process.env.EMAIL_VERIFICATION_EXPIRY_MINUTES || 15);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: otpHash,
          emailVerificationExpiresAt: expiresAt,
          emailOtpAttempts: 0,
          emailOtpLastSentAt: now,
          emailOtpLockedUntil: null,
        }
      });

      // Send OTP via Real Email
      await sendEmail(
        user.email!,
        "Welcome to KnowledgeShare - Verify your email",
        `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome, ${displayName}!</h2>
            <p>Thank you for joining KnowledgeShare.</p>
            <p>Your verification code is:</p>
            <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otpCode}</h1>
            <p>This code will expire in 15 minutes.</p>
           </div>`
      );

      // Return user info but NO login token yet
      return sendSuccess(
        req,
        res,
        {
          requireVerification: true,
          email: user.email,
          message: "Registration successful. Please verify your email.",
        },
        201
      );
    } catch (err) {
      next(err);
    }
  });

  router.post("/verify-email-otp", async (req, res, next) => {
    try {
      const { email, otpCode } = req.body;
      if (!email || !otpCode) return sendError(req, res, 400, "ERR_VALIDATION", "Missing email or OTP");

      const prisma = getPrisma() as any;
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          isEmailVerified: true,
          emailVerificationToken: true,
          emailVerificationExpiresAt: true,
          emailOtpAttempts: true,
          emailOtpLockedUntil: true,
        }
      });

      if (!user) return sendError(req, res, 404, "ERR_NOT_FOUND", "User not found");
      if (user.isEmailVerified) return sendError(req, res, 400, "ERR_VALIDATION", "Email already verified");

      const now = new Date();
      if (user.emailOtpLockedUntil && user.emailOtpLockedUntil > now) {
        return sendError(req, res, 429, "ERR_RATE_LIMIT", "Too many attempts. Try again later.");
      }

      const otpHash = hashToken(otpCode);
      if (user.emailVerificationToken !== otpHash) {
        const nextAttempts = (user.emailOtpAttempts || 0) + 1;
        const maxAttempts = Number(process.env.EMAIL_OTP_MAX_ATTEMPTS || 5);
        const lockMinutes = Number(process.env.EMAIL_OTP_LOCK_MINUTES || 15);
        const shouldLock = nextAttempts >= maxAttempts;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailOtpAttempts: nextAttempts,
            emailOtpLockedUntil: shouldLock ? new Date(now.getTime() + lockMinutes * 60 * 1000) : null,
          }
        });

        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid OTP code");
      }

      if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt < now) {
        return sendError(req, res, 400, "ERR_EXPIRED", "OTP expired");
      }

      // Activate User
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiresAt: null,
          accountStatus: "ACTIVE",
          emailOtpAttempts: 0,
          emailOtpLockedUntil: null,
          emailOtpLastSentAt: null,
        },
        select: { id: true, email: true, phoneNumber: true, role: true, accountStatus: true, isEmailVerified: true, profile: true },
      });

      const accessToken = signToken({ id: user.id, email: user.email! });
      const refreshToken = generateRefreshToken();
      const refreshHash = hashToken(refreshToken);

      const userAgent = req.get("user-agent") || "unknown";
      const ipAddress = getRequestIp(req);

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refreshHash,
          userAgent,
          ipAddress,
          lastUsedAt: now,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      setAuthCookies(res, accessToken, refreshToken);

      return sendSuccess(req, res, { token: accessToken, user: updatedUser });
    } catch (err) { next(err); }
  });

  router.post("/resend-email-otp", async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return sendError(req, res, 400, "ERR_VALIDATION", "Missing email");

      const prisma = getPrisma() as any;
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          isEmailVerified: true,
          emailOtpAttempts: true,
          emailOtpLastSentAt: true,
          emailOtpLockedUntil: true,
        }
      });

      if (!user) return sendError(req, res, 404, "ERR_NOT_FOUND", "User not found");
      if (user.isEmailVerified) return sendError(req, res, 400, "ERR_VALIDATION", "Email already verified");

      const now = new Date();
      if (user.emailOtpLockedUntil && user.emailOtpLockedUntil > now) {
        return sendError(req, res, 429, "ERR_RATE_LIMIT", "Too many attempts. Try again later.");
      }

      const cooldownSeconds = Number(process.env.EMAIL_OTP_COOLDOWN_SECONDS || 90);
      if (user.emailOtpLastSentAt) {
        const elapsedMs = now.getTime() - new Date(user.emailOtpLastSentAt).getTime();
        if (elapsedMs < cooldownSeconds * 1000) {
          return sendError(req, res, 429, "ERR_RATE_LIMIT", "Please wait before requesting another code.");
        }
      }

      const otpCode = generateOtpCode();
      const otpHash = hashToken(otpCode);
      const expiryMinutes = Number(process.env.EMAIL_VERIFICATION_EXPIRY_MINUTES || 15);
      const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: otpHash,
          emailVerificationExpiresAt: expiresAt,
          emailOtpAttempts: 0,
          emailOtpLastSentAt: now,
          emailOtpLockedUntil: null,
        }
      });

      // Send OTP via Real Email
      await sendEmail(
        user.email!,
        "Verify your email",
        `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify your email</h2>
            <p>Your verification code is:</p>
            <h1 style="background: #f4f4f4; padding: 10px; text-align: center; letter-spacing: 5px;">${otpCode}</h1>
            <p>This code will expire in 15 minutes.</p>
           </div>`
      );

      return sendSuccess(req, res, { message: "OTP resent" });
    } catch (err) { next(err); }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(req, res, 400, "ERR_VALIDATION", "Invalid body", parsed.error.issues);
      }

      const prisma = getPrisma() as any;
      const email = parsed.data.email.toLowerCase();

      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: { select: { displayName: true } } },
      });
      if (!user || !user.passwordHash) {
        return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Invalid credentials");
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return sendError(req, res, 423, "ERR_LOCKED", "Account temporarily locked. Try again later.");
      }

      if (user.accountStatus === "PENDING_VERIFY") {
        return sendError(req, res, 403, "ERR_FORBIDDEN", "Email not verified", {
          requireVerification: true,
          email: user.email,
        });
      }

      if (["INACTIVE", "SUSPENDED", "BANNED", "DELETED"].includes(user.accountStatus)) {
        return sendError(req, res, 403, "ERR_FORBIDDEN", "Account is not active");
      }

      const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!ok) {
        const nextAttempts = (user.loginAttempts || 0) + 1;
        const maxAttempts = Number(process.env.LOGIN_MAX_ATTEMPTS || 5);
        const lockMinutes = Number(process.env.LOGIN_LOCK_MINUTES || 15);
        const shouldLock = nextAttempts >= maxAttempts;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: nextAttempts,
            lockedUntil: shouldLock ? new Date(Date.now() + lockMinutes * 60 * 1000) : null,
          },
        });

        return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Invalid credentials");
      }

      if (user.loginAttempts || user.lockedUntil) {
        await prisma.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockedUntil: null },
        });
      }

      if (!user.isEmailVerified) {
        return sendError(req, res, 403, "ERR_FORBIDDEN", "Email not verified", {
          requireVerification: true,
          email: user.email,
        });
      }

      const accessToken = signToken({ id: user.id, email: user.email! });
      const refreshToken = generateRefreshToken();
      const refreshHash = hashToken(refreshToken);

      const userAgent = req.get("user-agent") || "unknown";
      const ipAddress = getRequestIp(req);
      const now = new Date();

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash: refreshHash,
          userAgent,
          ipAddress,
          lastUsedAt: now,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      setAuthCookies(res, accessToken, refreshToken);

      return sendSuccess(req, res, {
        token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.profile?.displayName,
          role: user.role,
          accountStatus: user.accountStatus,
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.post("/refresh", async (req, res, next) => {
    try {
      const refreshToken = (req as any).cookies?.refresh_token;

      if (!refreshToken) {
        return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Missing refresh token");
      }
      if (!isCsrfValid(req)) {
        return sendError(req, res, 403, "ERR_FORBIDDEN", "Invalid CSRF token");
      }

      const prisma = getPrisma() as any;
      const refreshHash = hashToken(refreshToken);
      const existing = await prisma.refreshToken.findUnique({ where: { tokenHash: refreshHash } });
      if (!existing || existing.revoked || existing.expiresAt < new Date()) {
        return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Invalid refresh token");
      }

      const user = await prisma.user.findUnique({ where: { id: existing.userId } });
      if (!user) return sendError(req, res, 404, "ERR_NOT_FOUND", "User not found");
      if (["PENDING_VERIFY", "INACTIVE", "SUSPENDED", "BANNED", "DELETED"].includes(user.accountStatus)) {
        await prisma.refreshToken.updateMany({
          where: { userId: user.id },
          data: { revoked: true }
        });
        return sendError(req, res, 403, "ERR_FORBIDDEN", "Account is not active");
      }

      const newRefresh = generateRefreshToken();
      const newRefreshHash = hashToken(newRefresh);

      const now = new Date();
      const userAgent = req.get("user-agent") || "unknown";
      const ipAddress = getRequestIp(req);

      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { tokenHash: refreshHash },
          data: { revoked: true, replacedBy: newRefreshHash, lastUsedAt: now },
        }),
        prisma.refreshToken.create({
          data: {
            userId: user.id,
            tokenHash: newRefreshHash,
            userAgent,
            ipAddress,
            lastUsedAt: now,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      const accessToken = signToken({ id: user.id, email: user.email! });
      setAuthCookies(res, accessToken, newRefresh);

      return sendSuccess(req, res, { token: accessToken });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout", async (req, res, next) => {
    try {
      const refreshToken = (req as any).cookies?.refresh_token;

      if (refreshToken && isCsrfValid(req)) {
        const prisma = getPrisma() as any;
        const refreshHash = hashToken(refreshToken);
        await prisma.refreshToken.updateMany({
          where: { tokenHash: refreshHash },
          data: { revoked: true },
        });
      }

      clearAuthCookies(res);
      return sendSuccess(req, res, { message: "Logged out" });
    } catch (err) {
      next(err);
    }
  });

  router.post("/logout-all", authenticate, async (req, res, next) => {
    try {
      if (!isCsrfValid(req)) {
        return sendError(req, res, 403, "ERR_FORBIDDEN", "Invalid CSRF token");
      }

      const prisma = getPrisma() as any;
      const userId = Number((req as any).user?.id);
      if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { revoked: true },
      });

      try {
        await redis.del(`auth:me:${userId}`);
      } catch (e) {
        // ignore cache errors
      }

      clearAuthCookies(res);
      return sendSuccess(req, res, { message: "Logged out from all devices" });
    } catch (err) {
      next(err);
    }
  });

  router.get("/me", authenticate, async (req, res, next) => {
    try {
      const decodedUser = (req as any).user;
      const userId = Number(decodedUser?.id);
      if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

      const cacheKey = `auth:me:${userId}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return sendSuccess(req, res, JSON.parse(cached));
      }

      const prisma = getPrisma() as any;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          role: true,
          accountStatus: true,
          isEmailVerified: true,
          profile: {
            select: {
              displayName: true,
              avatarUrl: true
            }
          }
        }
      });

      if (!user) return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");

      const responseData = {
        id: user.id,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        status: 'authenticated',
        name: user.profile?.displayName,
        avatar: user.profile?.avatarUrl
      };

      // Cache for 2 minutes (Session fast-path)
      await redis.set(cacheKey, JSON.stringify(responseData), "EX", 120);

      return sendSuccess(req, res, responseData);

    } catch (err) {
      next(err);
    }
  });



  return router;
}
