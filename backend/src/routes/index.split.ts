// Main Routes Configuration - Combines authentication and profile routes
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { createAuthRoutes } from "./auth.split.js";
import { createProfileRoutes } from "./profile.split.js";

/**
 * Create and configure all API routes for the split user system
 */
export const createSplitUserRoutes = (prisma: PrismaClient) => {
  const router = Router();

  // Authentication routes
  router.use("/auth", createAuthRoutes(prisma));

  // Profile routes
  router.use("/profile", createProfileRoutes(prisma));

  return router;
};

// Example usage in your main app file:
/*
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createSplitUserRoutes } from './routes/index.split.js';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use('/api/v1', createSplitUserRoutes(prisma));

app.listen(4000, () => {
  console.log('Server running on port 4000');
});
*/
