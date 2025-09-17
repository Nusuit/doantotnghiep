import { Request, Response, NextFunction } from "express";

interface User {
  role: string;
  [key: string]: any;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
