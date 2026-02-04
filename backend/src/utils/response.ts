import type { Request, Response } from "express";

export function sendSuccess<T>(
  req: Request,
  res: Response,
  data: T,
  status = 200
) {
  return res.status(status).json({
    success: true,
    data,
    requestId: (req as any).requestId,
  });
}

export function sendError(
  req: Request,
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
    requestId: (req as any).requestId,
  });
}
