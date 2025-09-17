import auditLogger from "./auditLog";
import { Request, Response, NextFunction } from "express";

interface User {
  id: string;
  role: string;
  [key: string]: any;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

export function auditAction(action: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    auditLogger.info({
      action,
      user: req.user?.id,
      route: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
    next();
  };
}
