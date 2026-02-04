import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function requestContext() {
  return (req: Request, res: Response, next: NextFunction) => {
    const existing = req.header("x-request-id");
    const requestId = existing && existing.length > 0 ? existing : crypto.randomUUID();

    (req as any).requestId = requestId;
    res.setHeader("x-request-id", requestId);

    next();
  };
}
