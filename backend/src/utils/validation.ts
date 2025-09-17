// Validation utility functions
import { ValidationSchemas } from "../types/user.types.js";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: "email", message: "Email is required" });
  } else {
    if (email.length > ValidationSchemas.email.maxLength) {
      errors.push({
        field: "email",
        message: `Email must not exceed ${ValidationSchemas.email.maxLength} characters`,
      });
    }
    if (!ValidationSchemas.email.pattern.test(email)) {
      errors.push({ field: "email", message: "Invalid email format" });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate password
 */
export const validatePassword = (password: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push({ field: "password", message: "Password is required" });
  } else {
    if (password.length < ValidationSchemas.password.minLength) {
      errors.push({
        field: "password",
        message: `Password must be at least ${ValidationSchemas.password.minLength} characters long`,
      });
    }
    if (password.length > ValidationSchemas.password.maxLength) {
      errors.push({
        field: "password",
        message: `Password must not exceed ${ValidationSchemas.password.maxLength} characters`,
      });
    }
    if (!ValidationSchemas.password.pattern.test(password)) {
      errors.push({
        field: "password",
        message:
          "Password must contain uppercase, lowercase, number, and special character",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate display name
 */
export const validateDisplayName = (displayName: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (!displayName) {
    errors.push({ field: "displayName", message: "Display name is required" });
  } else {
    if (displayName.trim().length < ValidationSchemas.displayName.minLength) {
      errors.push({
        field: "displayName",
        message: `Display name must be at least ${ValidationSchemas.displayName.minLength} character long`,
      });
    }
    if (displayName.length > ValidationSchemas.displayName.maxLength) {
      errors.push({
        field: "displayName",
        message: `Display name must not exceed ${ValidationSchemas.displayName.maxLength} characters`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phoneNumber?: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (phoneNumber && phoneNumber.trim()) {
    if (phoneNumber.length > ValidationSchemas.phoneNumber.maxLength) {
      errors.push({
        field: "phoneNumber",
        message: `Phone number must not exceed ${ValidationSchemas.phoneNumber.maxLength} characters`,
      });
    }
    if (!ValidationSchemas.phoneNumber.pattern.test(phoneNumber)) {
      errors.push({
        field: "phoneNumber",
        message: "Invalid phone number format",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate request body against multiple fields
 */
export const validateRequest = (
  data: any,
  validators: Array<(data: any) => ValidationResult>
): ValidationResult => {
  const allErrors: ValidationError[] = [];

  for (const validator of validators) {
    const result = validator(data);
    allErrors.push(...result.errors);
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .slice(0, 1000); // Limit length to prevent extremely long inputs
};

/**
 * Check if string contains only allowed characters
 */
export const isAlphanumericWithSpaces = (input: string): boolean => {
  return /^[a-zA-Z0-9\s]+$/.test(input);
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate date string
 */
export const validateDate = (dateString: string): ValidationResult => {
  const errors: ValidationError[] = [];

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      errors.push({ field: "date", message: "Invalid date format" });
    } else {
      // Check if date is reasonable (not too far in past or future)
      const now = new Date();
      const minDate = new Date(now.getFullYear() - 150, 0, 1); // 150 years ago
      const maxDate = new Date(now.getFullYear() + 1, 11, 31); // Next year

      if (date < minDate) {
        errors.push({ field: "date", message: "Date is too far in the past" });
      }
      if (date > maxDate) {
        errors.push({ field: "date", message: "Date cannot be in the future" });
      }
    }
  } catch {
    errors.push({ field: "date", message: "Invalid date format" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate age from birth date
 */
export const validateAge = (
  birthDate: Date,
  minAge: number = 13,
  maxAge: number = 150
): ValidationResult => {
  const errors: ValidationError[] = [];
  const now = new Date();
  const age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();

  // Adjust age if birthday hasn't occurred this year
  const exactAge =
    monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  if (exactAge < minAge) {
    errors.push({
      field: "birthDate",
      message: `You must be at least ${minAge} years old`,
    });
  }
  if (exactAge > maxAge) {
    errors.push({ field: "birthDate", message: "Invalid birth date" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Password strength checker
 */
export const checkPasswordStrength = (
  password: string
): {
  score: number; // 0-4
  suggestions: string[];
} => {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score++;
  else suggestions.push("Use at least 8 characters");

  if (/[a-z]/.test(password)) score++;
  else suggestions.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score++;
  else suggestions.push("Add uppercase letters");

  if (/\d/.test(password)) score++;
  else suggestions.push("Add numbers");

  if (/[^a-zA-Z\d]/.test(password)) score++;
  else suggestions.push("Add special characters");

  // Bonus points for length
  if (password.length >= 12) score = Math.min(score + 1, 5);

  return { score, suggestions };
};

/**
 * Check for common weak passwords
 */
export const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    "password",
    "123456",
    "123456789",
    "qwerty",
    "abc123",
    "password123",
    "admin",
    "letmein",
    "welcome",
    "monkey",
    "1234567890",
    "password1",
    "123123",
    "qwertyuiop",
  ];

  return commonPasswords.includes(password.toLowerCase());
};
