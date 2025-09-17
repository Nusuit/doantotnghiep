// Authentication Middleware - JWT token verification and user authentication
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    roles: string[];
  };
}

interface JWTPayload {
  id: number;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is required",
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
    };

    next();
  } catch (error: any) {
    console.error("Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    } else if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token has expired",
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
 * Middleware to check if user has specific role
 */
export const requireRole = (requiredRole: string) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!req.user.roles.includes(requiredRole)) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has any of the specified roles
 */
export const requireAnyRole = (roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const hasRequiredRole = roles.some((role) =>
      req.user!.roles.includes(role)
    );

    if (!hasRequiredRole) {
      res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
      return;
    }

    next();
  };
};

/**
 * Optional authentication - adds user info if token is present but doesn't require it
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      req.user = {
        id: decoded.id,
        email: decoded.email,
        roles: decoded.roles || [],
      };
    }

    next();
  } catch (error) {
    // Don't fail on invalid token for optional auth
    next();
  }
};

/**
 * Middleware to validate account status
 */
export const requireActiveAccount = (prisma: PrismaClient) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // Check user status in database
      const user = await prisma.userAuthentication.findUnique({
        where: { id: req.user.id },
        select: {
          accountStatus: true,
          isEmailVerified: true,
          lockedUntil: true,
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        res.status(423).json({
          success: false,
          message: "Account is temporarily locked",
        });
        return;
      }

      // Check account status
      if (user.accountStatus !== "active") {
        let message = "Account is not active";
        if (user.accountStatus === "pending") {
          message = "Please verify your email address";
        } else if (user.accountStatus === "suspended") {
          message = "Account is suspended";
        } else if (user.accountStatus === "banned") {
          message = "Account is banned";
        }

        res.status(403).json({
          success: false,
          message,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Account validation error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

/**
 * Rate limiting middleware (basic implementation)
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    lastReset: number;
  };
}

const rateLimitStore: RateLimitStore = {};

export const rateLimit = (maxRequests: number, windowMs: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();

    if (!rateLimitStore[key]) {
      rateLimitStore[key] = { count: 1, lastReset: now };
      next();
      return;
    }

    const timeWindow = rateLimitStore[key].lastReset + windowMs;

    if (now > timeWindow) {
      // Reset window
      rateLimitStore[key] = { count: 1, lastReset: now };
      next();
      return;
    }

    if (rateLimitStore[key].count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((timeWindow - now) / 1000),
      });
      return;
    }

    rateLimitStore[key].count++;
    next();
  };
};

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;

  Object.keys(rateLimitStore).forEach((key) => {
    if (now - rateLimitStore[key].lastReset > oneHour) {
      delete rateLimitStore[key];
    }
  });
}, 60 * 60 * 1000); // Run every hour
