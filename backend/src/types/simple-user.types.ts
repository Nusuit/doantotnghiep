// SIMPLIFIED TYPES - Chỉ những gì cần thiết cho business logic
export enum AccountStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

// User Authentication interface (bảng users)
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  role: UserRole;
  lastLoginAt: Date | null;
  loginAttempts: number;
  lockedUntil: Date | null;
  passwordResetToken: string | null;
  passwordResetExpiresAt: Date | null;
  emailVerificationToken: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  profile?: UserProfile;
}

// User Profile interface (bảng user_profiles)
export interface UserProfile {
  id: number;
  userId: number;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  birthDate: Date | null;
  gender: Gender | null;
  phoneNumber: string | null;
  country: string | null;
  city: string | null;
  address: string | null;
  language: string;
  timezone: string;
  isProfilePublic: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  user?: User;
}

// Complete user info (từ view user_complete_view)
export interface CompleteUserInfo {
  id: number;
  email: string;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  role: UserRole;
  lastLoginAt: Date | null;
  registeredAt: Date;

  // Profile info
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  birthDate: Date | null;
  gender: Gender | null;
  phoneNumber: string | null;
  country: string | null;
  city: string | null;
  language: string;
  isProfilePublic: boolean;
  profileUpdatedAt: Date | null;
}

// DTOs for API requests
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  user?: CompleteUserInfo;
  message?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
  birthDate?: string;
  gender?: Gender;
  phoneNumber?: string;
  country?: string;
  city?: string;
  address?: string;
  language?: string;
  timezone?: string;
  isProfilePublic?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Validation schemas
export const ValidationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, // At least 1 lowercase, 1 uppercase, 1 digit
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
    pattern: /^[\+]?[0-9\-\s\(\)]{10,20}$/,
    maxLength: 20,
  },
  bio: {
    maxLength: 1000,
  },
} as const;

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
