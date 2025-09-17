// Authentication Service - Handles all authentication-related operations
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  UserAuthentication,
  CreateUserAuthRequest,
  UpdateUserAuthRequest,
  LoginRequest,
  LoginResponse,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  EmailVerificationRequest,
  AccountStatus,
  CompleteUserInfo,
} from "../types/user.types.js";

export class AuthService {
  private prisma: PrismaClient;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly REFRESH_TOKEN_EXPIRES_DAYS: number;
  private readonly MAX_LOGIN_ATTEMPTS: number;
  private readonly LOCK_TIME_MINUTES: number;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
    this.REFRESH_TOKEN_EXPIRES_DAYS = parseInt(
      process.env.REFRESH_TOKEN_EXPIRES_DAYS || "7"
    );
    this.MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5");
    this.LOCK_TIME_MINUTES = parseInt(process.env.LOCK_TIME_MINUTES || "15");
  }

  /**
   * Create new user authentication record
   */
  async createAuth(data: CreateUserAuthRequest): Promise<UserAuthentication> {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    return this.prisma.userAuthentication.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        emailVerificationToken,
        emailVerificationExpiresAt,
        accountStatus: AccountStatus.PENDING, // Requires email verification
      },
      include: {
        profile: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Find user authentication by email
   */
  async findByEmail(email: string): Promise<UserAuthentication | null> {
    return this.prisma.userAuthentication.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Find user authentication by ID
   */
  async findById(id: number): Promise<UserAuthentication | null> {
    return this.prisma.userAuthentication.findUnique({
      where: { id },
      include: {
        profile: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Authenticate user login
   */
  async login(
    data: LoginRequest,
    userAgent?: string,
    ip?: string
  ): Promise<LoginResponse> {
    const user = await this.findByEmail(data.email);

    if (!user) {
      return { success: false, message: "Invalid credentials" };
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const lockTimeRemaining = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 1000 / 60
      );
      return {
        success: false,
        message: `Account is locked. Try again in ${lockTimeRemaining} minutes`,
      };
    }

    // Check account status
    if (user.accountStatus !== AccountStatus.ACTIVE) {
      let message = "Account is not active";
      if (user.accountStatus === AccountStatus.PENDING) {
        message = "Please verify your email address";
      } else if (user.accountStatus === AccountStatus.SUSPENDED) {
        message = "Account is suspended";
      } else if (user.accountStatus === AccountStatus.BANNED) {
        message = "Account is banned";
      }
      return { success: false, message };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      // Increment login attempts
      await this.incrementLoginAttempts(user.id);
      return { success: false, message: "Invalid credentials" };
    }

    // Reset login attempts and update last login
    await this.resetLoginAttempts(user.id);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(
      user.id,
      userAgent,
      ip
    );

    // Get complete user info
    const completeUserInfo = await this.getCompleteUserInfo(user.id);

    return {
      success: true,
      accessToken,
      refreshToken: refreshToken.token,
      user: completeUserInfo,
    };
  }

  /**
   * Update user authentication data
   */
  async updateAuth(
    id: number,
    data: UpdateUserAuthRequest
  ): Promise<UserAuthentication> {
    const updateData: any = {};

    if (data.email) {
      // Check if new email is already taken
      const existingUser = await this.prisma.userAuthentication.findFirst({
        where: {
          email: data.email.toLowerCase(),
          id: { not: id },
        },
      });
      if (existingUser) {
        throw new Error("Email already exists");
      }
      updateData.email = data.email.toLowerCase();
      updateData.isEmailVerified = false; // Reset verification for new email
      updateData.emailVerificationToken = crypto
        .randomBytes(32)
        .toString("hex");
      updateData.emailVerificationExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );
    }

    if (data.newPassword && data.currentPassword) {
      const user = await this.findById(id);
      if (!user) {
        throw new Error("User not found");
      }

      const isValidPassword = await bcrypt.compare(
        data.currentPassword,
        user.passwordHash
      );
      if (!isValidPassword) {
        throw new Error("Current password is incorrect");
      }

      updateData.passwordHash = await bcrypt.hash(data.newPassword, 12);
    }

    if (typeof data.twoFactorEnabled === "boolean") {
      updateData.twoFactorEnabled = data.twoFactorEnabled;
    }

    return this.prisma.userAuthentication.update({
      where: { id },
      data: updateData,
      include: {
        profile: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<boolean> {
    const user = await this.findByEmail(data.email);
    if (!user) {
      // Don't reveal if email exists for security
      return true;
    }

    const passwordResetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.userAuthentication.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpiresAt,
      },
    });

    // TODO: Send email with reset token

    return true;
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(
    data: PasswordResetConfirmRequest
  ): Promise<boolean> {
    const user = await this.prisma.userAuthentication.findFirst({
      where: {
        passwordResetToken: data.token,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12);

    await this.prisma.userAuthentication.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        loginAttempts: 0, // Reset login attempts
        lockedUntil: null, // Unlock account if locked
      },
    });

    return true;
  }

  /**
   * Verify email address
   */
  async verifyEmail(data: EmailVerificationRequest): Promise<boolean> {
    const user = await this.prisma.userAuthentication.findFirst({
      where: {
        emailVerificationToken: data.token,
        emailVerificationExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    await this.prisma.userAuthentication.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        accountStatus: AccountStatus.ACTIVE, // Activate account
      },
    });

    return true;
  }

  /**
   * Get complete user information (auth + profile)
   */
  async getCompleteUserInfo(authId: number): Promise<CompleteUserInfo | null> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        ua.id as authId,
        ua.email,
        ua.is_email_verified as isEmailVerified,
        ua.last_login_at as lastLoginAt,
        ua.account_status as accountStatus,
        ua.two_factor_enabled as twoFactorEnabled,
        ua.login_attempts as loginAttempts,
        ua.locked_until as lockedUntil,
        ua.created_at as registeredAt,
        
        up.id as profileId,
        up.display_name as displayName,
        up.first_name as firstName,
        up.last_name as lastName,
        up.bio,
        up.profile_picture_url as profilePictureUrl,
        up.birth_date as birthDate,
        up.gender,
        up.phone_number as phoneNumber,
        up.country,
        up.city,
        up.language,
        up.timezone,
        up.is_profile_public as isProfilePublic,
        up.receive_notifications as receiveNotifications,
        up.receive_marketing as receiveMarketing,
        up.profile_completed_at as profileCompletedAt,
        up.profile_completion_percentage as profileCompletionPercentage,
        up.updated_at as profileUpdatedAt
      FROM user_authentications ua
      LEFT JOIN user_profiles up ON ua.id = up.auth_user_id
      WHERE ua.id = ?
    `;

    return result[0] || null;
  }

  // Private helper methods

  private generateAccessToken(user: UserAuthentication): string {
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.roles?.map((ur) => ur.role?.key) || [],
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  private async generateRefreshToken(
    userId: number,
    userAgent?: string,
    ip?: string
  ): Promise<{ token: string }> {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + this.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        userAgent,
        ip,
      },
    });

    return { token };
  }

  private async incrementLoginAttempts(userId: number): Promise<void> {
    const user = await this.prisma.userAuthentication.findUnique({
      where: { id: userId },
      select: { loginAttempts: true },
    });

    if (!user) return;

    const newAttempts = user.loginAttempts + 1;
    const updateData: any = { loginAttempts: newAttempts };

    // Lock account if max attempts reached
    if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      updateData.lockedUntil = new Date(
        Date.now() + this.LOCK_TIME_MINUTES * 60 * 1000
      );
      updateData.accountStatus = AccountStatus.LOCKED;
    }

    await this.prisma.userAuthentication.update({
      where: { id: userId },
      data: updateData,
    });
  }

  private async resetLoginAttempts(userId: number): Promise<void> {
    await this.prisma.userAuthentication.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        accountStatus: AccountStatus.ACTIVE, // Unlock if was locked
      },
    });
  }
}
