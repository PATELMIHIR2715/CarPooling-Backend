import type { CorsOptions } from "cors";
import env from "./env.js";
import { CORS_NOT_ALLOWED } from "../constants/messages.js";
import {
  AUTHORIZATION_HEADER,
  CONTENT_TYPE_HEADER,
  LOCALHOST_3000,
  LOCALHOST_5173,
  LOCALHOST_5174,
  LOCALHOST_5175,
  LOOPBACK_3000,
  LOOPBACK_5173,
  NGROK_SKIP_BROWSER_WARNING_HEADER,
  NODE_ENV_PRODUCTION,
} from "../constants/labels.js";

const configuredOrigins = env.CORS_ORIGIN?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const developmentOrigins = [
  LOCALHOST_3000,
  LOCALHOST_5173,
  LOCALHOST_5174,
  LOCALHOST_5175,
  LOOPBACK_3000,
  LOOPBACK_5173,
];

export const allowedOrigins =
  configuredOrigins && configuredOrigins.length > 0
    ? configuredOrigins
    : env.NODE_ENV === NODE_ENV_PRODUCTION
      ? []
      : developmentOrigins;

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(CORS_NOT_ALLOWED));
  },
  credentials: true,
  allowedHeaders: [
    CONTENT_TYPE_HEADER,
    AUTHORIZATION_HEADER,
    NGROK_SKIP_BROWSER_WARNING_HEADER,
  ],
};
