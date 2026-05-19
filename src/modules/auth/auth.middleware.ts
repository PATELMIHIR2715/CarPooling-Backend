import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import { FORBIDDEN, UNAUTHORIZED } from "../../constants/messages.js";

export const authenticate = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: UNAUTHORIZED });
  }
  const token: string = authHeader?.split(" ")[1] as string;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: UNAUTHORIZED });
  }
};

export const authorize = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: FORBIDDEN });
    }
    next();
  };
};
