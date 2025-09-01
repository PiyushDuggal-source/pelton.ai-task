import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";

declare module "express-serve-static-core" {
  interface Request {
    user?: { userId: string };
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
