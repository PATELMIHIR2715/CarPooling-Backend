import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Creating a token
export const generateTokens = (userId: string, role: string, name: string) => {
  const accessToken = jwt.sign({ userId, role, name }, env.JWT_SECRET, {
    expiresIn: "60m",
  });
  const refreshToken = jwt.sign({ userId, role, name }, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

export const generateAccessToken = (userId: string, role: string, name: string) =>
  jwt.sign({ userId, role, name }, env.JWT_SECRET, { expiresIn: "600m" });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET);

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET);
