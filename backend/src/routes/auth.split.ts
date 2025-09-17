// Authentication Routes - API endpoints for authentication operations
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthController } from "../controllers/AuthController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Initialize controller (you'll need to pass your Prisma instance here)
export const createAuthRoutes = (prisma: PrismaClient) => {
  const authController = new AuthController(prisma);

  // Public routes (no authentication required)
  router.post("/register", authController.register);
  router.post("/login", authController.login);
  router.post("/logout", authController.logout);
  router.post("/password/reset", authController.requestPasswordReset);
  router.post("/password/reset/confirm", authController.confirmPasswordReset);
  router.post("/email/verify", authController.verifyEmail);

  // Protected routes (authentication required)
  router.get("/me", authenticateToken, authController.me);
  router.put("/update", authenticateToken, authController.updateAuth);

  return router;
};

export default router;
