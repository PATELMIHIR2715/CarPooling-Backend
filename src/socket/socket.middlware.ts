import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const socketAuthMiddleware = (socket: any, next: any) => {
  try {
    const token = socket?.handshake?.auth?.token?.replace("Bearer ", "");
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      role: string;
      name: string;
    };
    socket.user = decoded;
    next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid token"));
  }
};
