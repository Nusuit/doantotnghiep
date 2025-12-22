import express from "express";
import cors from "cors";

type AnyFn = (...args: any[]) => any;

// Reuse the battle-tested JS runtime pieces (kept for now)
// These paths are resolved from dist/* at runtime, so we use ../
const { loadEnv } = require("../config/env") as { loadEnv: (raw: any) => any };
const { apiRateLimiter } = require("../middleware/rateLimit") as { apiRateLimiter: AnyFn };
const { requestContext } = require("../middleware/requestContext") as {
    requestContext: () => AnyFn;
};
const { getPrisma } = require("../db/prisma") as { getPrisma: () => any };

export function createApp() {
    // Fail fast on env (production-first)
    const env = loadEnv(process.env);

    const app = express();
    app.disable("x-powered-by");

    app.use(
        cors({
            origin: String(env.CORS_ORIGIN)
                .split(",")
                .map((s: string) => s.trim()),
            credentials: true,
        })
    );

    app.use(requestContext());
    app.use(express.json({ limit: "1mb" }));
    app.use("/api/", apiRateLimiter);

    // Stable MVP routes (reuse JS routes; TS migration can be gradual)
    app.use("/api/auth", require("../routes/auth-prisma"));
    app.use("/api/restaurants", require("../routes/restaurants"));

    app.get("/api/health", (req, res) => {
        res.json({ status: "ok" });
    });

    app.get("/api/ready", async (req, res) => {
        try {
            const prisma = getPrisma();
            await prisma.$queryRaw`SELECT 1`;
            res.json({ status: "ok" });
        } catch {
            res.status(503).json({ status: "degraded" });
        }
    });

    // Keep the older TS module router reachable for incremental migration
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const legacyTsRoutes = require("./routes").default;
        if (legacyTsRoutes) app.use("/api/ts", legacyTsRoutes);
    } catch {
        // ignore
    }

    // 404
    app.use((req: any, res: any) => {
        res.status(404).json({
            success: false,
            code: "ERR_NOT_FOUND",
            message: "Not found",
            requestId: req.requestId,
        });
    });

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
        const code = err.code || "ERR_INTERNAL";
        const status = err.status || 500;
        const message = err.message || "Internal server error";
        res.status(status).json({
            success: false,
            code,
            message,
            requestId: req.requestId,
        });
    });

    return { app, env };
}

export default createApp().app;
