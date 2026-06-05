import { Queue } from "bullmq";
import { Redis } from "@upstash/redis";
import env from "./env.js";

const connection = {
  host: new URL(env.UPSTASH_REDIS_URL).hostname,
  port: 6379,
  password: env.UPSTASH_REDIS_TOKEN,
  tls: {},
};

export const emailQueue = new Queue("email", { connection });

export const EMAIL_JOBS = {
  WELCOME: "welcome_email",
  OTP: "otp_email",
  BOOKING_REQUEST: "booking_request_email",
  BOOKING_CONFIRMATION: "booking_confirmation_email",
  BOOKING_REJECT: "booking_reject_email",
  TRIP_REMINDER: "trip_reminder_email",
  TRIP_STARTED: "trip_started_email",
} as const;
