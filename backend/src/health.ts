import { Request, Response } from "express";

export function healthz(req: Request, res: Response) {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}

export function readyz(req: Request, res: Response) {
  res.json({ status: "ready", timestamp: new Date().toISOString() });
}

export function metrics(req: Request, res: Response) {
  // TODO: expose Prometheus metrics
  res.send("metrics");
}
