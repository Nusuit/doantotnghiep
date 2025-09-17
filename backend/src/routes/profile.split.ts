// Profile Routes - API endpoints for profile operations
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { ProfileController } from "../controllers/ProfileController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Initialize controller (you'll need to pass your Prisma instance here)
export const createProfileRoutes = (prisma: PrismaClient) => {
  const profileController = new ProfileController(prisma);

  // Public routes (no authentication required)
  router.get("/public", profileController.getPublicProfiles);
  router.get("/search", profileController.searchProfiles);
  router.get("/:id", profileController.getProfileById);

  // Protected routes (authentication required)
  router.get("/", authenticateToken, profileController.getProfile);
  router.put("/", authenticateToken, profileController.updateProfile);
  router.delete("/", authenticateToken, profileController.deleteProfile);
  router.get(
    "/stats/completion",
    authenticateToken,
    profileController.getCompletionStats
  );
  router.put(
    "/picture",
    authenticateToken,
    profileController.updateProfilePicture
  );
  router.put(
    "/visibility",
    authenticateToken,
    profileController.toggleProfileVisibility
  );

  return router;
};

export default router;
