import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

const idempotencyStore = new Map<string, any>();

export function idempotencyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.headers["idempotency-key"] as string;
  if (!key) return next();
  if (idempotencyStore.has(key)) {
    return res.json(idempotencyStore.get(key));
  }
  res.on("finish", () => {
    idempotencyStore.set(key, res.locals.responseData);
  });
  next();
}

export function setResponseData(res: Response, data: any) {
  res.locals.responseData = data;
}
