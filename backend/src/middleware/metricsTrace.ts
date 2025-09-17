import { Request, Response, NextFunction } from "express";
import { httpRequestDurationMicroseconds } from "./metrics";
import { randomUUID } from "crypto";

export function metricsTrace(req: Request, res: Response, next: NextFunction) {
  const startHrTime = process.hrtime();
  const traceId = randomUUID();
  res.setHeader("X-Correlation-Id", traceId);
  (req as any).traceId = traceId;

  res.on("finish", () => {
    const diff = process.hrtime(startHrTime);
    const durationMs = diff[0] * 1000 + diff[1] / 1e6;
    httpRequestDurationMicroseconds
      .labels(
        req.method,
        req.route?.path || req.originalUrl,
        String(res.statusCode)
      )
      .observe(durationMs);
  });
  next();
}
