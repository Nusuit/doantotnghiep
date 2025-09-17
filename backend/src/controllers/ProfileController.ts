// Profile Controller - Handles HTTP requests for profile operations
import { Request, Response } from "express";
import { ProfileService } from "../services/ProfileService.js";
import {
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  Gender,
  ValidationSchemas,
} from "../types/user.types.js";
import { PrismaClient } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    roles: string[];
  };
}

export class ProfileController {
  private profileService: ProfileService;

  constructor(prisma: PrismaClient) {
    this.profileService = new ProfileService(prisma);
  }

  /**
   * Get current user's profile
   */
  getProfile = async (
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

      const profile = await this.profileService.findByAuthUserId(req.user.id);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: "Profile not found",
        });
        return;
      }

      res.json({
        success: true,
        profile,
      });
    } catch (error: any) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  /**
   * Update current user's profile
   */
  updateProfile = async (
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

      const data: UpdateUserProfileRequest = req.body;

      // Validate request data
      const errors = this.validateUpdateProfileRequest(data);
      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
        return;
      }

      const updatedProfile = await this.profileService.updateProfile(
        req.user.id,
        data
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
    } catch (error: any) {
      console.error("Update profile error:", error);

      if (error.message === "Profile not found") {
        res.status(404).json({
          success: false,
          message: "Profile not found",
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
   * Get profile by profile ID (public endpoint)
   */
  getProfileById = async (req: Request, res: Response): Promise<void> => {
    try {
      const profileId = parseInt(req.params.id);

      if (isNaN(profileId)) {
        res.status(400).json({
          success: false,
          message: "Invalid profile ID",
        });
        return;
      }

      const profile = await this.profileService.findById(profileId);

      if (!profile) {
        res.status(404).json({
          success: false,
          message: "Profile not found",
        });
        return;
      }

      // Only return profile if it's public
      if (!profile.isProfilePublic) {
        res.status(403).json({
          success: false,
          message: "Profile is private",
        });
        return;
      }

      // Remove sensitive information
      const publicProfile = {
        ...profile,
        authentication: undefined, // Don't expose auth data
      };

      res.json({
        success: true,
        profile: publicProfile,
      });
    } catch (error: any) {
      console.error("Get profile by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  /**
   * Get public profiles with pagination
   */
  getPublicProfiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // Max 50 per page

      const result = await this.profileService.getPublicProfiles(page, limit);

      // Remove sensitive information from profiles
      const publicProfiles = result.profiles.map((profile) => ({
        ...profile,
        authentication: profile.authentication
          ? {
              isEmailVerified: profile.authentication.isEmailVerified,
              accountStatus: profile.authentication.accountStatus,
              createdAt: profile.authentication.createdAt,
            }
          : undefined,
      }));

      res.json({
        success: true,
        ...result,
        profiles: publicProfiles,
      });
    } catch (error: any) {
      console.error("Get public profiles error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  /**
   * Search profiles
   */
  searchProfiles = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query.q as string;

      if (!query || query.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: "Search query must be at least 2 characters long",
        });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // Max 50 per page

      const result = await this.profileService.searchProfiles(
        query.trim(),
        page,
        limit
      );

      // Remove sensitive information from profiles
      const publicProfiles = result.profiles.map((profile) => ({
        ...profile,
        authentication: profile.authentication
          ? {
              isEmailVerified: profile.authentication.isEmailVerified,
              accountStatus: profile.authentication.accountStatus,
              createdAt: profile.authentication.createdAt,
            }
          : undefined,
      }));

      res.json({
        success: true,
        ...result,
        profiles: publicProfiles,
        query,
      });
    } catch (error: any) {
      console.error("Search profiles error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  /**
   * Get profile completion statistics
   */
  getCompletionStats = async (
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

      const stats = await this.profileService.getCompletionStats(req.user.id);

      res.json({
        success: true,
        stats,
      });
    } catch (error: any) {
      console.error("Get completion stats error:", error);

      if (error.message === "Profile not found") {
        res.status(404).json({
          success: false,
          message: "Profile not found",
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
   * Update profile picture
   */
  updateProfilePicture = async (
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

      const { pictureUrl } = req.body;

      if (!pictureUrl || typeof pictureUrl !== "string") {
        res.status(400).json({
          success: false,
          message: "Valid picture URL is required",
        });
        return;
      }

      // Basic URL validation
      try {
        new URL(pictureUrl);
      } catch {
        res.status(400).json({
          success: false,
          message: "Invalid picture URL format",
        });
        return;
      }

      const updatedProfile = await this.profileService.updateProfilePicture(
        req.user.id,
        pictureUrl
      );

      res.json({
        success: true,
        message: "Profile picture updated successfully",
        profile: updatedProfile,
      });
    } catch (error: any) {
      console.error("Update profile picture error:", error);

      if (error.message === "Profile not found") {
        res.status(404).json({
          success: false,
          message: "Profile not found",
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
   * Toggle profile visibility
   */
  toggleProfileVisibility = async (
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

      const { isProfilePublic } = req.body;

      if (typeof isProfilePublic !== "boolean") {
        res.status(400).json({
          success: false,
          message: "isProfilePublic must be a boolean value",
        });
        return;
      }

      const updatedProfile = await this.profileService.updateProfile(
        req.user.id,
        {
          isProfilePublic,
        }
      );

      res.json({
        success: true,
        message: `Profile is now ${isProfilePublic ? "public" : "private"}`,
        profile: updatedProfile,
      });
    } catch (error: any) {
      console.error("Toggle profile visibility error:", error);

      if (error.message === "Profile not found") {
        res.status(404).json({
          success: false,
          message: "Profile not found",
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
   * Delete profile
   */
  deleteProfile = async (
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

      const success = await this.profileService.deleteProfile(req.user.id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: "Profile not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "Profile deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  // Private validation methods

  private validateUpdateProfileRequest(
    data: UpdateUserProfileRequest
  ): string[] {
    const errors: string[] = [];

    if (data.displayName !== undefined) {
      if (
        !data.displayName ||
        data.displayName.trim().length < ValidationSchemas.displayName.minLength
      ) {
        errors.push(
          "Display name is required and must be at least 1 character"
        );
      }
      if (data.displayName.length > ValidationSchemas.displayName.maxLength) {
        errors.push(
          `Display name must not exceed ${ValidationSchemas.displayName.maxLength} characters`
        );
      }
    }

    if (data.firstName !== undefined && data.firstName) {
      if (data.firstName.length > ValidationSchemas.firstName.maxLength) {
        errors.push(
          `First name must not exceed ${ValidationSchemas.firstName.maxLength} characters`
        );
      }
    }

    if (data.lastName !== undefined && data.lastName) {
      if (data.lastName.length > ValidationSchemas.lastName.maxLength) {
        errors.push(
          `Last name must not exceed ${ValidationSchemas.lastName.maxLength} characters`
        );
      }
    }

    if (data.phoneNumber !== undefined && data.phoneNumber) {
      if (!ValidationSchemas.phoneNumber.pattern.test(data.phoneNumber)) {
        errors.push("Invalid phone number format");
      }
    }

    if (data.birthDate !== undefined && data.birthDate) {
      const birthDate = new Date(data.birthDate);
      if (isNaN(birthDate.getTime())) {
        errors.push("Invalid birth date format");
      } else {
        const minAge = 13;
        const maxAge = 150;
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age < minAge) {
          errors.push("You must be at least 13 years old");
        }
        if (age > maxAge) {
          errors.push("Invalid birth date");
        }
      }
    }

    if (data.gender !== undefined && data.gender) {
      const validGenders = Object.values(Gender);
      if (!validGenders.includes(data.gender)) {
        errors.push("Invalid gender value");
      }
    }

    return errors;
  }
}
