import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import {
  ACCOUNT_RESTRICTED,
  FORBIDDEN,
  UNAUTHORIZED,
} from "../../constants/messages.js";
import redis from "../../config/redis.js";
import { errorResponseStandard } from "../../utils/response.utils.js";
import { BEARER_PREFIX, RESTRICTED_USERS_SET } from "../../constants/labels.js";

export const authenticate = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith(BEARER_PREFIX)) {
    return errorResponseStandard(new Error(UNAUTHORIZED), res, 401);
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return errorResponseStandard(new Error(UNAUTHORIZED), res, 401);
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    const isRestricted = await redis.sismember(
      RESTRICTED_USERS_SET,
      req.user.userId
    );
    if (isRestricted) {
      return errorResponseStandard(new Error(ACCOUNT_RESTRICTED), res, 403);
    }
    next();
  } catch (error) {
    return errorResponseStandard(new Error(UNAUTHORIZED), res, 401);
  }
};

export const authorize = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return errorResponseStandard(new Error(FORBIDDEN), res, 403);
    }
    next();
  };
};
