// Authentication Controller - Handles HTTP requests for authentication operations
import { Request, Response } from "express";
import { AuthService } from "../services/AuthService.js";
import { ProfileService } from "../services/ProfileService.js";
import {
  CreateUserAuthRequest,
  UpdateUserAuthRequest,
  LoginRequest,
  RegisterRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  EmailVerificationRequest,
  ValidationSchemas,
} from "../types/user.types.js";
import { PrismaClient } from "@prisma/client";
import { validateRequest } from "../utils/validation.js";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    roles: string[];
  };
}

export class AuthController {
  private authService: AuthService;
  private profileService: ProfileService;

  constructor(prisma: PrismaClient) {
    this.authService = new AuthService(prisma);
    this.profileService = new ProfileService(prisma);
  }

  /**
   * Register new user
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: RegisterRequest = req.body;

      // Validate request data
      const errors = this.validateRegisterRequest(data);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }

      // Create authentication record
      const authUser = await this.authService.createAuth({
        email: data.email,
        password: data.password,
      });

      // Create profile record
      const displayName =
        data.displayName ||
        this.profileService.generateDisplayNameFromEmail(data.email);
      await this.profileService.createProfile(authUser.id, {
        displayName,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      // Get complete user info
      const completeUserInfo = await this.authService.getCompleteUserInfo(
        authUser.id
      );

      res.status(201).json({
        success: true,
        user: completeUserInfo,
        message:
          "Registration successful. Please check your email for verification instructions.",
        requiresEmailVerification: true,
      });
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.message === "Email already exists") {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  /**
   * Login user
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: LoginRequest = req.body;

      // Validate request data
      const errors = this.validateLoginRequest(data);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }

      // Get client info
      const userAgent = req.headers["user-agent"];
      const ip =
        req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

      // Attempt login
      const loginResult = await this.authService.login(data, userAgent, ip);

      if (!loginResult.success) {
        res.status(401).json(loginResult);
        return;
      }

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", loginResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove refresh token from response body
      const { refreshToken, ...responseData } = loginResult;

      res.json(responseData);
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  /**
   * Logout user
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      // TODO: Revoke refresh token in database
      // const refreshToken = req.cookies.refreshToken;
      // if (refreshToken) {
      //   await this.authService.revokeRefreshToken(refreshToken);
      // }

      res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      console.error("Logout error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  /**
   * Get current user info
   */
  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const completeUserInfo = await this.authService.getCompleteUserInfo(
        req.user.id
      );

      if (!completeUserInfo) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.json({
        success: true,
        user: completeUserInfo,
      });
    } catch (error: any) {
      console.error("Get user info error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  /**
   * Update user authentication data
   */
  updateAuth = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const data: UpdateUserAuthRequest = req.body;

      // Validate request data
      const errors = this.validateUpdateAuthRequest(data);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }

      const updatedAuth = await this.authService.updateAuth(req.user.id, data);

      res.json({
        success: true,
        message: "Authentication data updated successfully",
        auth: {
          id: updatedAuth.id,
          email: updatedAuth.email,
          isEmailVerified: updatedAuth.isEmailVerified,
          twoFactorEnabled: updatedAuth.twoFactorEnabled,
          accountStatus: updatedAuth.accountStatus,
        },
      });
    } catch (error: any) {
      console.error("Update auth error:", error);

      if (error.message === "Email already exists") {
        res.status(409).json({
          success: false,
          message: "Email already in use",
        });
      } else if (error.message === "Current password is incorrect") {
        res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  /**
   * Request password reset
   */
  requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: PasswordResetRequest = req.body;

      if (!data.email || !ValidationSchemas.email.pattern.test(data.email)) {
        res.status(400).json({
          success: false,
          message: "Valid email is required",
        });
        return;
      }

      await this.authService.requestPasswordReset(data);

      // Always return success for security (don't reveal if email exists)
      res.json({
        success: true,
        message:
          "If an account with this email exists, you will receive password reset instructions.",
      });
    } catch (error: any) {
      console.error("Password reset request error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  /**
   * Confirm password reset
   */
  confirmPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: PasswordResetConfirmRequest = req.body;

      if (!data.token || !data.newPassword) {
        res.status(400).json({
          success: false,
          message: "Reset token and new password are required",
        });
        return;
      }

      // Validate new password
      if (!ValidationSchemas.password.pattern.test(data.newPassword)) {
        res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character",
        });
        return;
      }

      await this.authService.confirmPasswordReset(data);

      res.json({
        success: true,
        message: "Password has been reset successfully",
      });
    } catch (error: any) {
      console.error("Password reset confirmation error:", error);

      if (error.message === "Invalid or expired reset token") {
        res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  /**
   * Verify email address
   */
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: EmailVerificationRequest = req.body;

      if (!data.token) {
        res.status(400).json({
          success: false,
          message: "Verification token is required",
        });
        return;
      }

      await this.authService.verifyEmail(data);

      res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error: any) {
      console.error("Email verification error:", error);

      if (error.message === "Invalid or expired verification token") {
        res.status(400).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    }
  };

  // Private validation methods

  private validateRegisterRequest(data: RegisterRequest): string[] {
    const errors: string[] = [];

    if (!data.email || !ValidationSchemas.email.pattern.test(data.email)) {
      errors.push("Valid email is required");
    }

    if (
      !data.password ||
      data.password.length < ValidationSchemas.password.minLength
    ) {
      errors.push(
        `Password must be at least ${ValidationSchemas.password.minLength} characters long`
      );
    }

    if (
      data.password &&
      !ValidationSchemas.password.pattern.test(data.password)
    ) {
      errors.push(
        "Password must contain uppercase, lowercase, number, and special character"
      );
    }

    if (
      !data.displayName ||
      data.displayName.trim().length < ValidationSchemas.displayName.minLength
    ) {
      errors.push("Display name is required");
    }

    return errors;
  }

  private validateLoginRequest(data: LoginRequest): string[] {
    const errors: string[] = [];

    if (!data.email || !ValidationSchemas.email.pattern.test(data.email)) {
      errors.push("Valid email is required");
    }

    if (!data.password) {
      errors.push("Password is required");
    }

    return errors;
  }

  private validateUpdateAuthRequest(data: UpdateUserAuthRequest): string[] {
    const errors: string[] = [];

    if (data.email && !ValidationSchemas.email.pattern.test(data.email)) {
      errors.push("Valid email is required");
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        errors.push("Current password is required to set new password");
      }

      if (data.newPassword.length < ValidationSchemas.password.minLength) {
        errors.push(
          `New password must be at least ${ValidationSchemas.password.minLength} characters long`
        );
      }

      if (!ValidationSchemas.password.pattern.test(data.newPassword)) {
        errors.push(
          "New password must contain uppercase, lowercase, number, and special character"
        );
      }
    }

    return errors;
  }
}
