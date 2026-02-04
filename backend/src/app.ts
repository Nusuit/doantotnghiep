import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { createContextApiRouter } from "./contextApi";
import { loadEnv } from "./config/env";
import { apiRateLimiter, authRateLimiter } from "./middleware/rateLimit";
import { requestContext } from "./middleware/requestContext";
import { createAuthRouter } from "./routes/auth";
import { createRestaurantsRouter } from "./routes/restaurants";
import { createReadyRouter } from "./routes/ready";
import "./modules/redis"; // Trigger to connect Redis
import { createUsersRouter } from "./routes/user"; // Import named export
import { createFeedRouter } from "./routes/feed";
import { sendError } from "./utils/response";

export function createApp() {
    // Fail fast on env (production-first)
    const env = loadEnv(process.env);

    const app = express();
    app.disable("x-powered-by");

    const allowedOrigins = String(env.CORS_ORIGIN)
        .split(",")
        .map((s: string) => s.trim());

    console.log("🔒 CORS Allowed Origins:", allowedOrigins);

    app.use(
        cors({
            origin: allowedOrigins,
            credentials: true,
        })
    );

    app.use(helmet());
    app.use(compression());
    app.use(cookieParser());

    app.use(requestContext());
    app.use(express.json({ limit: "1mb" }));
    app.use("/api/", apiRateLimiter);

    // TS-only routes
    app.use("/api/auth", authRateLimiter, createAuthRouter());
    app.use("/api/restaurants", createRestaurantsRouter());
    app.use("/api/users", createUsersRouter()); // Register user routes
    app.use("/api/feed", createFeedRouter()); // Register feed routes


    // Context-based discovery APIs (doc-compliant)
    app.use("/api", createContextApiRouter());

    app.use("/api", createReadyRouter());

    // 404
    app.use((req: any, res: any) => {
        return sendError(req, res, 404, "ERR_NOT_FOUND", "Not found");
    });

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
        const code = err.code || "ERR_INTERNAL";
        const status = err.status || 500;
        let message = err.message || "Internal server error";

        // Hide internal details in production context unless specific logical error
        if (status === 500 && process.env.NODE_ENV === "production") {
            console.error("🔥 [INTERNAL ERROR]", err);
            message = "Something went wrong on our end. Please try again later.";
        }

        return sendError(req, res, status, code, message);
    });

    return { app, env };
}

export default createApp().app;
