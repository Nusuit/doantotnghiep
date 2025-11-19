import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@repo/prisma";
import otpService from "../../services/otpService";
import smsService from "../../services/smsService";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  code?: string;
  statusCode?: number;
  user?: any;
  tokens?: AuthTokens;
  isNewUser?: boolean;
  retryAfter?: number;
}

class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!;
  private readonly JWT_EXPIRES_IN = "15m";
  private readonly REFRESH_TOKEN_EXPIRES_DAYS = 30;

  /**
   * Generate JWT access token and refresh token
   */
  generateTokens(user: any): AuthTokens {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    const refreshToken = require("crypto").randomBytes(32).toString("hex");

    return { accessToken, refreshToken };
  }

  /**
   * Send OTP to phone number
   */
  async sendOtp(phoneNumber: string): Promise<AuthResult> {
    // Check rate limiting
    const rateLimit = await otpService.checkRateLimit(phoneNumber);
    if (!rateLimit.allowed) {
      return {
        success: false,
        statusCode: 429,
        code: "TOO_MANY_REQUESTS",
        message: `Bạn đã vượt quá giới hạn ${rateLimit.limit} OTP/giờ. Vui lòng thử lại sau.`,
        retryAfter: 3600,
      };
    }

    // Generate OTP code
    const otpCode = otpService.generateOtp();

    // Store OTP in database
    await otpService.storeOtp(phoneNumber, otpCode);

    // Send SMS
    const sent = await smsService.sendOtp(phoneNumber, otpCode);

    if (!sent) {
      return {
        success: false,
        statusCode: 500,
        code: "SMS_SEND_FAILED",
        message: "Không thể gửi OTP. Vui lòng thử lại sau.",
      };
    }

    return {
      success: true,
      message: "OTP đã được gửi đến số điện thoại của bạn",
    };
  }

  /**
   * Verify OTP and authenticate user (login or register)
   */
  async verifyOtpAndAuth(
    phoneNumber: string,
    otpCode: string,
    userAgent: string | null,
    ip: string | null
  ): Promise<AuthResult> {
    // Verify OTP
    const verificationResult = await otpService.verifyOtp(phoneNumber, otpCode);

    if (!verificationResult.valid) {
      const errorMessages: Record<string, string> = {
        NO_OTP_FOUND: "Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại.",
        OTP_ALREADY_USED: "Mã OTP đã được sử dụng.",
        OTP_EXPIRED: "Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.",
        MAX_ATTEMPTS_EXCEEDED:
          "Bạn đã nhập sai quá 3 lần. Vui lòng yêu cầu gửi OTP mới.",
        INVALID_OTP_CODE: "Mã OTP không đúng. Vui lòng thử lại.",
        VERIFICATION_ERROR: "Lỗi xác thực OTP.",
      };

      return {
        success: false,
        statusCode: 401,
        code: verificationResult.reason || "INVALID_OTP",
        message:
          errorMessages[verificationResult.reason || ""] ||
          "Mã OTP không hợp lệ",
      };
    }

    // OTP is valid - check if user exists
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
      select: {
        id: true,
        phoneNumber: true,
        email: true,
        accountStatus: true,
      },
    });

    let isNewUser = false;

    if (!user) {
      // Create new user with phone number
      console.log(`👤 Creating new user with phone: ${phoneNumber}`);

      user = await prisma.user.create({
        data: {
          phoneNumber: phoneNumber,
          isPhoneVerified: true,
          accountStatus: "active",
        },
        select: {
          id: true,
          phoneNumber: true,
          email: true,
          accountStatus: true,
        },
      });

      isNewUser = true;

      // Create default user profile
      const displayName = `User${user.id}`;
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          displayName: displayName,
        },
      });

      console.log(`✅ New user created: ID ${user.id}`);
    } else {
      // Update phone verification status and last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPhoneVerified: true,
          lastLoginAt: new Date(),
        },
      });

      console.log(`✅ Existing user logged in: ID ${user.id}`);
    }

    // Check account status
    if (user.accountStatus !== "active") {
      return {
        success: false,
        statusCode: 403,
        code: "ACCOUNT_DISABLED",
        message: "Tài khoản đã bị khóa",
      };
    }

    // Generate JWT tokens
    const tokens = this.generateTokens(user);
    const expTime = new Date(
      Date.now() + this.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    );

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: expTime,
        userAgent: userAgent,
        ip: ip,
        revoked: false,
      },
    });

    return {
      success: true,
      message: isNewUser ? "Đăng ký thành công!" : "Đăng nhập thành công!",
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        accountStatus: user.accountStatus,
      },
      tokens,
      isNewUser,
    };
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string): Promise<AuthResult> {
    // Check if refresh token exists and not revoked
    const tokenData = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revoked: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            accountStatus: true,
          },
        },
      },
    });

    if (!tokenData) {
      return {
        success: false,
        statusCode: 401,
        code: "INVALID_TOKEN",
        message: "Refresh token không hợp lệ",
      };
    }

    // Check if token expired
    if (new Date() > tokenData.expiresAt) {
      return {
        success: false,
        statusCode: 401,
        code: "TOKEN_EXPIRED",
        message: "Refresh token đã hết hạn",
      };
    }

    // Check user status
    if (tokenData.user.accountStatus !== "active") {
      return {
        success: false,
        statusCode: 403,
        code: "ACCOUNT_DISABLED",
        message: "Tài khoản đã bị khóa",
      };
    }

    // Generate new tokens
    const newTokens = this.generateTokens(tokenData.user);
    const expTime = new Date(
      Date.now() + this.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    );

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: tokenData.id },
      data: { revoked: true },
    });

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        userId: tokenData.user.id,
        token: newTokens.refreshToken,
        expiresAt: expTime,
        revoked: false,
      },
    });

    return {
      success: true,
      tokens: newTokens,
    };
  }

  /**
   * Revoke refresh token (logout)
   */
  async revokeRefreshToken(token: string, userId: number): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: {
        token: token,
        userId: userId,
      },
      data: {
        revoked: true,
      },
    });
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: number): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      user: {
        ...user,
        isProfileSetup: !!user.profile?.firstName,
        profileComplete: !!(user.profile?.firstName && user.profile?.lastName),
      },
    };
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: number,
    profileData: any
  ): Promise<AuthResult> {
    const {
      fullName,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phoneNumber,
      country,
      address,
      foodPreferences,
      priceRange,
      preferredLocation,
    } = profileData;

    const displayName =
      fullName || `${firstName || ""} ${lastName || ""}`.trim() || null;

    // Check if profile exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      // Create new profile
      await prisma.userProfile.create({
        data: {
          userId,
          displayName,
          firstName: firstName || null,
          lastName: lastName || null,
          birthDate: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          phoneNumber: phoneNumber || null,
          country: country || null,
          address: address || null,
          bio: JSON.stringify({
            foodPreferences: foodPreferences || {},
            priceRange: priceRange || null,
            preferredLocation: preferredLocation || null,
          }),
        },
      });
    } else {
      // Update existing profile
      await prisma.userProfile.update({
        where: { userId },
        data: {
          displayName,
          firstName: firstName || null,
          lastName: lastName || null,
          birthDate: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          phoneNumber: phoneNumber || null,
          country: country || null,
          address: address || null,
          bio: JSON.stringify({
            foodPreferences: foodPreferences || {},
            priceRange: priceRange || null,
            preferredLocation: preferredLocation || null,
          }),
        },
      });
    }

    return {
      success: true,
      message: "Profile updated successfully",
    };
  }
}

export default new AuthService();
