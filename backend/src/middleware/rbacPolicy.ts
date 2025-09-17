import { Request, Response, NextFunction } from "express";

// Example RBAC policy map
const policy: { [key: string]: string[] } = {
  user: ["read:profile", "update:profile", "create:comment"],
  mod: ["*"],
  admin: ["*"],
  finance: ["read:wallet", "update:wallet", "admin:payouts"],
};

export function requirePermission(permission: string) {
  return (
    req: Request & { user?: { role: string } },
    res: Response,
    next: NextFunction
  ) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: "Unauthorized" });
    const allowed = policy[role];
    if (!allowed || (!allowed.includes("*") && !allowed.includes(permission))) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}
