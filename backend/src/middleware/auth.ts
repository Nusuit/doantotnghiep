import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { loadEnv } from "../config/env";
import { sendError } from "../utils/response";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const cookieToken = (req as any).cookies?.access_token;
    const token = bearerToken || cookieToken;

    if (!token) {
        return sendError(req, res, 401, "ERR_UNAUTHORIZED", "No token provided");
    }

    try {
        const { JWT_SECRET: secret } = loadEnv(process.env);
        const decoded = jwt.verify(token, secret);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Invalid token");
    }
};

export const requireActiveUser = async (req: Request, res: Response, next: NextFunction) => {
    const userId = Number((req as any).user?.id);
    if (!userId) return sendError(req, res, 401, "ERR_UNAUTHORIZED", "Unauthorized");

    try {
        // We must check DB for current status, not rely on token
        const { getPrisma } = require("../db/prisma"); // Dynamic import to avoid circular dep if any
        const prisma = getPrisma();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { accountStatus: true }
        });

        if (!user || user.accountStatus !== "ACTIVE") {
            return sendError(req, res, 403, "ERR_FORBIDDEN", "Account is not active");
        }

        next();
    } catch (e) {
        console.error("requireActiveUser error:", e);
        return sendError(req, res, 500, "ERR_INTERNAL", "Internal Check Error");
    }
};

export const requireCsrf = (req: Request, res: Response, next: NextFunction) => {
    // Basic hygiene: If using Bearer token, we assume it's a non-browser client (Mobile/Server)
    // -> CSRF check skipped.
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return next();
    }

    // If using Cookies (Browser), MUST validate CSRF
    const csrfToken = req.cookies?.csrf_token;
    const csrfHeader = req.header("x-csrf-token");

    if (!csrfToken || !csrfHeader || csrfToken !== csrfHeader) {
        return sendError(req, res, 403, "ERR_CSRF", "Invalid or missing CSRF token");
    }
    next();
};
