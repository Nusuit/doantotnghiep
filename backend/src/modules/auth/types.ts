import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email?: string | null;
    phoneNumber?: string | null;
  };
}

export interface JWTPayload {
  id: number;
  email?: string | null;
  phoneNumber?: string | null;
  iat?: number;
  exp?: number;
}

export interface OtpVerificationResult {
  valid: boolean;
  reason?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
}
