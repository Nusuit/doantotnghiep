import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import authService from "./service";
import { AuthRequest } from "./types";

class AuthController {
  /**
   * POST /api/auth/send-otp
   * Send OTP code to phone number via SMS
   */
  async sendOtp(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.body;

      // Validate phone number format (Vietnam: +84xxxxxxxxx)
      if (!phoneNumber || !phoneNumber.match(/^\+84\d{9,10}$/)) {
        return res.status(400).json({
          code: "INVALID_PHONE",
          message: "Số điện thoại không hợp lệ. Định dạng: +84xxxxxxxxx",
        });
      }

      console.log(`📱 OTP request for: ${phoneNumber}`);

      const result = await authService.sendOtp(phoneNumber);

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          code: result.code,
          message: result.message,
          retryAfter: result.retryAfter,
        });
      }

      res.json({
        success: true,
        message: result.message,
        phoneNumber: phoneNumber,
        expiresIn: 300,
        otpSentAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("❌ Send OTP error:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Lỗi gửi OTP",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * POST /api/auth/verify-otp
   * Verify OTP and login/register user
   */
  async verifyOtp(req: Request, res: Response) {
    try {
      const { phoneNumber, otpCode } = req.body;

      if (!phoneNumber || !otpCode) {
        return res.status(400).json({
          code: "BAD_REQUEST",
          message: "Số điện thoại và mã OTP là bắt buộc",
        });
      }

      console.log(`🔐 Verifying OTP for: ${phoneNumber}`);

      const result = await authService.verifyOtpAndAuth(
        phoneNumber,
        otpCode,
        req.headers["user-agent"] || null,
        req.ip || null
      );

      if (!result.success) {
        return res.status(result.statusCode || 401).json({
          code: result.code,
          message: result.message,
        });
      }

      res.json({
        success: true,
        message: result.message,
        user: result.user,
        tokens: result.tokens,
        isNewUser: result.isNewUser,
      });
    } catch (error: any) {
      console.error("❌ Verify OTP error:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Lỗi xác thực OTP",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  /**
   * POST /api/auth/resend-otp
   */
  async resendOtp(req: Request, res: Response) {
    try {
      const { phoneNumber } = req.body;

      if (!phoneNumber || !phoneNumber.match(/^\+84\d{9,10}$/)) {
        return res.status(400).json({
          code: "INVALID_PHONE",
          message: "Số điện thoại không hợp lệ",
        });
      }

      const result = await authService.sendOtp(phoneNumber);

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          code: result.code,
          message: result.message,
        });
      }

      res.json({
        success: true,
        message: "OTP mới đã được gửi",
        expiresIn: 300,
      });
    } catch (error: any) {
      console.error("❌ Resend OTP error:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Lỗi gửi lại OTP",
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Refresh access token using refresh token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          code: "BAD_REQUEST",
          message: "Refresh token là bắt buộc",
        });
      }

      const result = await authService.refreshTokens(refreshToken);

      if (!result.success) {
        return res.status(result.statusCode || 401).json({
          code: result.code,
          message: result.message,
        });
      }

      res.json({
        message: "Token đã được refresh",
        tokens: result.tokens,
      });
    } catch (error: any) {
      console.error("Refresh token error:", error);
      res.status(500).json({
        code: "INTERNAL_ERROR",
        message: "Refresh token thất bại",
      });
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken && req.user) {
        await authService.revokeRefreshToken(refreshToken, req.user.id);
      }

      res.json({ message: "Đăng xuất thành công" });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  }

  /**
   * GET /api/auth/profile
   */
  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const result = await authService.getUserProfile(req.user.id);

      if (!result.success) {
        return res.status(404).json({ success: false, error: result.message });
      }

      res.json({ success: true, user: result.user });
    } catch (error: any) {
      console.error("❌ Profile error:", error);
      res.status(500).json({ success: false, error: "Failed to get profile" });
    }
  }

  /**
   * PUT /api/auth/profile
   */
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const profileData = req.body;

      const result = await authService.updateUserProfile(
        req.user.id,
        profileData
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.message,
        });
      }

      res.json({
        success: true,
        message: "Cập nhật thông tin thành công",
      });
    } catch (error: any) {
      console.error("❌ Profile update error:", error);
      res.status(500).json({
        success: false,
        error: "Lỗi cập nhật thông tin",
      });
    }
  }
}

export default new AuthController();
