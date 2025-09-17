// TypeScript types and interfaces for the split user authentication and profile system

export enum AccountStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  BANNED = "banned",
  PENDING = "pending",
  LOCKED = "locked",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

// User Authentication interface
export interface UserAuthentication {
  id: number;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  accountStatus: AccountStatus;
  twoFactorEnabled: boolean;

  // Security fields
  loginAttempts: number;
  lockedUntil: Date | null;
  passwordResetToken: string | null;
  passwordResetExpiresAt: Date | null;
  emailVerificationToken: string | null;
  emailVerificationExpiresAt: Date | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  profile?: UserProfile;
  refreshTokens?: RefreshToken[];
  roles?: UserRole[];
}

// User Profile interface
export interface UserProfile {
  id: number;
  authUserId: number;

  // Display information
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  profilePictureUrl: string | null;

  // Personal details
  birthDate: Date | null;
  gender: Gender | null;
  phoneNumber: string | null;
  country: string | null;
  city: string | null;

  // Preferences
  language: string;
  timezone: string | null;
  isProfilePublic: boolean;
  receiveNotifications: boolean;
  receiveMarketing: boolean;

  // Profile completion
  profileCompletedAt: Date | null;
  profileCompletionPercentage: number;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  authentication?: UserAuthentication;
}

// Combined user info (for views and API responses)
export interface CompleteUserInfo {
  // Authentication data
  authId: number;
  email: string;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  accountStatus: AccountStatus;
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockedUntil: Date | null;
  registeredAt: Date;

  // Profile data
  profileId: number | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  birthDate: Date | null;
  gender: Gender | null;
  phoneNumber: string | null;
  country: string | null;
  city: string | null;
  language: string;
  timezone: string | null;
  isProfilePublic: boolean;
  receiveNotifications: boolean;
  receiveMarketing: boolean;
  profileCompletedAt: Date | null;
  profileCompletionPercentage: number;
  profileUpdatedAt: Date | null;
}

// DTOs for API requests/responses

export interface CreateUserAuthRequest {
  email: string;
  password: string;
}

export interface CreateUserProfileRequest {
  displayName: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  birthDate?: string; // ISO date string
  gender?: Gender;
  phoneNumber?: string;
  country?: string;
  city?: string;
  language?: string;
  timezone?: string;
  isProfilePublic?: boolean;
  receiveNotifications?: boolean;
  receiveMarketing?: boolean;
}

export interface UpdateUserAuthRequest {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  twoFactorEnabled?: boolean;
}

export interface UpdateUserProfileRequest {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePictureUrl?: string;
  birthDate?: string; // ISO date string
  gender?: Gender;
  phoneNumber?: string;
  country?: string;
  city?: string;
  language?: string;
  timezone?: string;
  isProfilePublic?: boolean;
  receiveNotifications?: boolean;
  receiveMarketing?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: CompleteUserInfo;
  message?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: CompleteUserInfo;
  message?: string;
  requiresEmailVerification?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

// Supporting types
export interface RefreshToken {
  id: number;
  userId: number;
  token: string;
  revoked: boolean;
  replacedBy: string | null;
  expiresAt: Date;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
}

export interface Role {
  id: number;
  key: string;
  name: string;
}

export interface UserRole {
  userId: number;
  roleId: number;
  user?: UserAuthentication;
  role?: Role;
}

// Validation schemas (for use with libraries like Joi or Zod)
export const ValidationSchemas = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  displayName: {
    required: true,
    minLength: 1,
    maxLength: 100,
  },
  firstName: {
    maxLength: 50,
  },
  lastName: {
    maxLength: 50,
  },
  phoneNumber: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    maxLength: 20,
  },
} as const;
