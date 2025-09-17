// Profile Service - Handles all user profile-related operations
import { PrismaClient } from "@prisma/client";
import {
  UserProfile,
  CreateUserProfileRequest,
  UpdateUserProfileRequest,
  Gender,
  CompleteUserInfo,
} from "../types/user.types.js";

export class ProfileService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create new user profile
   */
  async createProfile(
    authUserId: number,
    data: CreateUserProfileRequest
  ): Promise<UserProfile> {
    // Check if profile already exists
    const existingProfile = await this.findByAuthUserId(authUserId);
    if (existingProfile) {
      throw new Error("Profile already exists for this user");
    }

    // Verify auth user exists
    const authUser = await this.prisma.userAuthentication.findUnique({
      where: { id: authUserId },
    });
    if (!authUser) {
      throw new Error("Authentication user not found");
    }

    // Calculate initial completion percentage
    const completionPercentage = this.calculateCompletionPercentage(data);

    const profileData = {
      authUserId,
      displayName: data.displayName,
      firstName: data.firstName || null,
      lastName: data.lastName || null,
      bio: data.bio || null,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      gender: data.gender || null,
      phoneNumber: data.phoneNumber || null,
      country: data.country || null,
      city: data.city || null,
      language: data.language || "vi",
      timezone: data.timezone || "Asia/Ho_Chi_Minh",
      isProfilePublic: data.isProfilePublic !== false, // Default true
      receiveNotifications: data.receiveNotifications !== false, // Default true
      receiveMarketing: data.receiveMarketing || false,
      profileCompletionPercentage: completionPercentage,
      profileCompletedAt: completionPercentage >= 80 ? new Date() : null,
    };

    return this.prisma.userProfile.create({
      data: profileData,
      include: {
        authentication: true,
      },
    });
  }

  /**
   * Find profile by authentication user ID
   */
  async findByAuthUserId(authUserId: number): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { authUserId },
      include: {
        authentication: true,
      },
    });
  }

  /**
   * Find profile by profile ID
   */
  async findById(id: number): Promise<UserProfile | null> {
    return this.prisma.userProfile.findUnique({
      where: { id },
      include: {
        authentication: true,
      },
    });
  }

  /**
   * Update user profile
   */
  async updateProfile(
    authUserId: number,
    data: UpdateUserProfileRequest
  ): Promise<UserProfile> {
    const existingProfile = await this.findByAuthUserId(authUserId);
    if (!existingProfile) {
      throw new Error("Profile not found");
    }

    // Prepare update data
    const updateData: any = {};

    if (data.displayName !== undefined)
      updateData.displayName = data.displayName;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.profilePictureUrl !== undefined)
      updateData.profilePictureUrl = data.profilePictureUrl;
    if (data.birthDate !== undefined)
      updateData.birthDate = data.birthDate ? new Date(data.birthDate) : null;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.phoneNumber !== undefined)
      updateData.phoneNumber = data.phoneNumber;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.isProfilePublic !== undefined)
      updateData.isProfilePublic = data.isProfilePublic;
    if (data.receiveNotifications !== undefined)
      updateData.receiveNotifications = data.receiveNotifications;
    if (data.receiveMarketing !== undefined)
      updateData.receiveMarketing = data.receiveMarketing;

    // Recalculate completion percentage
    const mergedData = { ...existingProfile, ...updateData };
    const completionPercentage = this.calculateCompletionPercentage(mergedData);
    updateData.profileCompletionPercentage = completionPercentage;

    // Update completion date if profile is now sufficiently complete
    if (completionPercentage >= 80 && !existingProfile.profileCompletedAt) {
      updateData.profileCompletedAt = new Date();
    }

    return this.prisma.userProfile.update({
      where: { authUserId },
      data: updateData,
      include: {
        authentication: true,
      },
    });
  }

  /**
   * Delete user profile
   */
  async deleteProfile(authUserId: number): Promise<boolean> {
    const profile = await this.findByAuthUserId(authUserId);
    if (!profile) {
      return false;
    }

    await this.prisma.userProfile.delete({
      where: { authUserId },
    });

    return true;
  }

  /**
   * Get public profiles with pagination
   */
  async getPublicProfiles(
    page: number = 1,
    limit: number = 20
  ): Promise<{
    profiles: UserProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      this.prisma.userProfile.findMany({
        where: { isProfilePublic: true },
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          authentication: {
            select: {
              email: true,
              isEmailVerified: true,
              accountStatus: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.userProfile.count({
        where: { isProfilePublic: true },
      }),
    ]);

    return {
      profiles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search profiles by display name or location
   */
  async searchProfiles(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    profiles: UserProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const searchCondition = {
      isProfilePublic: true,
      OR: [
        {
          displayName: {
            contains: query,
            mode: "insensitive" as const,
          },
        },
        {
          country: {
            contains: query,
            mode: "insensitive" as const,
          },
        },
        {
          city: {
            contains: query,
            mode: "insensitive" as const,
          },
        },
      ],
    };

    const [profiles, total] = await Promise.all([
      this.prisma.userProfile.findMany({
        where: searchCondition,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          authentication: {
            select: {
              email: true,
              isEmailVerified: true,
              accountStatus: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.userProfile.count({
        where: searchCondition,
      }),
    ]);

    return {
      profiles,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get profile completion statistics
   */
  async getCompletionStats(authUserId: number): Promise<{
    completionPercentage: number;
    missingFields: string[];
    suggestions: string[];
  }> {
    const profile = await this.findByAuthUserId(authUserId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const missingFields = [];
    const suggestions = [];

    // Check required/recommended fields
    if (!profile.displayName) {
      missingFields.push("displayName");
      suggestions.push("Add a display name to help others identify you");
    }

    if (!profile.firstName || !profile.lastName) {
      missingFields.push("fullName");
      suggestions.push("Complete your full name for better recognition");
    }

    if (!profile.bio || profile.bio.length < 50) {
      missingFields.push("bio");
      suggestions.push("Write a compelling bio to tell others about yourself");
    }

    if (!profile.profilePictureUrl) {
      missingFields.push("profilePicture");
      suggestions.push(
        "Upload a profile picture to make your profile more personal"
      );
    }

    if (!profile.country || !profile.city) {
      missingFields.push("location");
      suggestions.push("Add your location to connect with people nearby");
    }

    if (!profile.phoneNumber) {
      missingFields.push("phoneNumber");
      suggestions.push("Add a phone number for better account security");
    }

    return {
      completionPercentage: profile.profileCompletionPercentage,
      missingFields,
      suggestions,
    };
  }

  /**
   * Update profile picture URL
   */
  async updateProfilePicture(
    authUserId: number,
    pictureUrl: string
  ): Promise<UserProfile> {
    const profile = await this.findByAuthUserId(authUserId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Recalculate completion percentage
    const updatedData = { ...profile, profilePictureUrl: pictureUrl };
    const completionPercentage =
      this.calculateCompletionPercentage(updatedData);

    return this.prisma.userProfile.update({
      where: { authUserId },
      data: {
        profilePictureUrl: pictureUrl,
        profileCompletionPercentage: completionPercentage,
        profileCompletedAt:
          completionPercentage >= 80 && !profile.profileCompletedAt
            ? new Date()
            : profile.profileCompletedAt,
      },
      include: {
        authentication: true,
      },
    });
  }

  /**
   * Generate display name from email if not provided
   */
  generateDisplayNameFromEmail(email: string): string {
    const username = email.split("@")[0];

    // Clean up the username and make it more readable
    return username
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  }

  // Private helper methods

  /**
   * Calculate profile completion percentage
   */
  private calculateCompletionPercentage(data: any): number {
    const fields = [
      { field: "displayName", weight: 20, required: true },
      { field: "firstName", weight: 10, required: false },
      { field: "lastName", weight: 10, required: false },
      { field: "bio", weight: 15, required: false },
      { field: "profilePictureUrl", weight: 15, required: false },
      { field: "birthDate", weight: 5, required: false },
      { field: "phoneNumber", weight: 10, required: false },
      { field: "country", weight: 7, required: false },
      { field: "city", weight: 8, required: false },
    ];

    let totalWeight = 0;
    let completedWeight = 0;

    for (const { field, weight, required } of fields) {
      totalWeight += weight;

      const value = data[field];
      const isCompleted = value !== null && value !== undefined && value !== "";

      if (isCompleted) {
        // Give extra weight for longer bios
        if (
          field === "bio" &&
          typeof value === "string" &&
          value.length >= 100
        ) {
          completedWeight += weight + 5; // Bonus for detailed bio
        } else {
          completedWeight += weight;
        }
      } else if (required) {
        // Deduct points for missing required fields
        completedWeight -= weight * 0.5;
      }
    }

    const percentage = Math.max(
      0,
      Math.min(100, Math.round((completedWeight / totalWeight) * 100))
    );
    return percentage;
  }
}
