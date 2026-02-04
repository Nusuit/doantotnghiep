import { Router } from "express";
import { getPrisma } from "../db/prisma";
import { sendError, sendSuccess } from "../utils/response";

export function createReadyRouter() {
  const router = Router();

  router.get("/health", (req, res) => {
    return sendSuccess(req, res, { status: "ok" });
  });

  router.get("/ready", async (req, res) => {
    try {
      const prisma = getPrisma();
      await prisma.$queryRaw`SELECT 1`;
      return sendSuccess(req, res, { status: "ok" });
    } catch {
      return sendError(req, res, 503, "ERR_UNAVAILABLE", "Service degraded", { status: "degraded" });
    }
  });

  return router;
}
