// SIMPLE USER SERVICE - Tất cả logic user trong 1 file
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  User,
  UserProfile,
  CompleteUserInfo,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AccountStatus,
  UserRole,
  ValidationRules,
} from "../types/simple-user.types.js";

export class UserService {
  private prisma: PrismaClient;
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
  }

  // ======================== AUTHENTICATION ========================

  /**
   * Register new user
   */
  async register(
    data: RegisterRequest
  ): Promise<{ user: CompleteUserInfo; token: string }> {
    // Validate
    this.validateEmail(data.email);
    this.validatePassword(data.password);
    this.validateDisplayName(data.displayName);

    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user with profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          emailVerificationToken: crypto.randomBytes(32).toString("hex"),
        },
      });

      // Create profile
      const profile = await tx.userProfile.create({
        data: {
          userId: user.id,
          displayName: data.displayName,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
        },
      });

      return { user, profile };
    });

    // Get complete user info
    const completeUser = await this.getCompleteUserInfo(result.user.id);
    if (!completeUser) throw new Error("Failed to create user");

    // Generate token
    const token = this.generateToken(result.user);

    return { user: completeUser, token };
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      return { success: false, message: "Invalid credentials" };
    }

    // Check account status
    if (user.accountStatus !== AccountStatus.ACTIVE) {
      return { success: false, message: "Account is not active" };
    }

    // Check if locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return { success: false, message: "Account is temporarily locked" };
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
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    // Get complete user info
    const completeUser = await this.getCompleteUserInfo(user.id);
    const token = this.generateToken(user);

    return {
      success: true,
      accessToken: token,
      user: completeUser,
    };
  }

  /**
   * Get user by ID with profile
   */
  async getUserById(id: number): Promise<CompleteUserInfo | null> {
    return this.getCompleteUserInfo(id);
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });
  }

  // ======================== PROFILE MANAGEMENT ========================

  /**
   * Update user profile
   */
  async updateProfile(
    userId: number,
    data: UpdateProfileRequest
  ): Promise<UserProfile> {
    // Validate
    if (data.displayName) this.validateDisplayName(data.displayName);

    const updateData: any = {};

    // Map all possible fields
    if (data.displayName !== undefined)
      updateData.displayName = data.displayName;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.birthDate !== undefined)
      updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.phoneNumber !== undefined)
      updateData.phoneNumber = data.phoneNumber;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.isProfilePublic !== undefined)
      updateData.isProfilePublic = data.isProfilePublic;
    if (data.emailNotifications !== undefined)
      updateData.emailNotifications = data.emailNotifications;
    if (data.pushNotifications !== undefined)
      updateData.pushNotifications = data.pushNotifications;

    return this.prisma.userProfile.update({
      where: { userId },
      data: updateData,
    });
  }

  /**
   * Get public profiles with pagination
   */
  async getPublicProfiles(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      this.prisma.userProfile.findMany({
        where: { isProfilePublic: true },
        include: {
          user: {
            select: {
              email: true,
              accountStatus: true,
              isEmailVerified: true,
              createdAt: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      this.prisma.userProfile.count({
        where: { isProfilePublic: true },
      }),
    ]);

    return {
      profiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ======================== PASSWORD MANAGEMENT ========================

  /**
   * Change password
   */
  async changePassword(
    userId: number,
    data: ChangePasswordRequest
  ): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      data.currentPassword,
      user.passwordHash
    );
    if (!isValidPassword) throw new Error("Current password is incorrect");

    // Validate new password
    this.validatePassword(data.newPassword);

    // Hash and update
    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return true;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: ForgotPasswordRequest): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if email exists
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiresAt: expiresAt,
      },
    });

    // TODO: Send email with reset link
    console.log(`Password reset token: ${resetToken}`);

    return true;
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: data.token,
        passwordResetExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) throw new Error("Invalid or expired reset token");

    this.validatePassword(data.newPassword);

    const passwordHash = await bcrypt.hash(data.newPassword, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    return true;
  }

  // ======================== ADMIN FUNCTIONS ========================

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: number, role: UserRole): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }

  /**
   * Update account status (admin only)
   */
  async updateAccountStatus(
    userId: number,
    status: AccountStatus
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { accountStatus: status },
    });
  }

  // ======================== PRIVATE HELPERS ========================

  private async getCompleteUserInfo(
    userId: number
  ): Promise<CompleteUserInfo | null> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        u.id, u.email, u.account_status as accountStatus,
        u.is_email_verified as isEmailVerified, u.role,
        u.last_login_at as lastLoginAt, u.created_at as registeredAt,
        p.display_name as displayName, p.first_name as firstName,
        p.last_name as lastName, p.avatar_url as avatarUrl,
        p.bio, p.birth_date as birthDate, p.gender,
        p.phone_number as phoneNumber, p.country, p.city,
        p.language, p.is_profile_public as isProfilePublic,
        p.updated_at as profileUpdatedAt
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ${userId}
    `;

    return result[0] || null;
  }

  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  private async incrementLoginAttempts(userId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { loginAttempts: true },
    });

    if (!user) return;

    const newAttempts = user.loginAttempts + 1;
    const updateData: any = { loginAttempts: newAttempts };

    // Lock account after 5 failed attempts for 15 minutes
    if (newAttempts >= 5) {
      updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }

  private validateEmail(email: string): void {
    if (!ValidationRules.email.pattern.test(email)) {
      throw new Error("Invalid email format");
    }
  }

  private validatePassword(password: string): void {
    if (password.length < ValidationRules.password.minLength) {
      throw new Error("Password must be at least 8 characters long");
    }
    if (!ValidationRules.password.pattern.test(password)) {
      throw new Error(
        "Password must contain at least one uppercase, lowercase and digit"
      );
    }
  }

  private validateDisplayName(displayName: string): void {
    if (!displayName || displayName.trim().length < 1) {
      throw new Error("Display name is required");
    }
    if (displayName.length > ValidationRules.displayName.maxLength) {
      throw new Error("Display name is too long");
    }
  }
}
