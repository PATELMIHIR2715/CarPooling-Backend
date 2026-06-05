import jwt from "jsonwebtoken";
import env from "../config/env.js";
import {
  SOCKET_AUTH_TOKEN_INVALID,
  SOCKET_AUTH_TOKEN_MISSING,
} from "../constants/messages.js";
import { BEARER_PREFIX } from "../constants/labels.js";

export const socketAuthMiddleware = (socket: any, next: any) => {
  try {
    const token = socket?.handshake?.auth?.token?.replace(BEARER_PREFIX, "");
    if (!token) {
      return next(new Error(SOCKET_AUTH_TOKEN_MISSING));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      role: string;
      name: string;
    };
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error(SOCKET_AUTH_TOKEN_INVALID));
  }
};
