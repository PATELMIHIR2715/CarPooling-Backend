import crypto from "crypto";
import redis from "../config/redis.js";
import { REGISTRATION_OTP_KEY_PREFIX } from "../constants/labels.js";

const REGISTRATION_OTP_TTL_SECONDS = 10 * 60;

const generateKey = (email: string) =>
  `${REGISTRATION_OTP_KEY_PREFIX}:${email.toLowerCase().trim()}`;
const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

export const generateRegistrationOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const storeRegistrationOtp = async (email: string, otp: string) => {
  const key = generateKey(email);
  await redis.set(key, hashOtp(otp));
  await redis.expire(key, REGISTRATION_OTP_TTL_SECONDS);
};

export const verifyRegistrationOtp = async (email: string, otp: string) => {
  const key = generateKey(email);
  const storedOtpHash = await redis.get<string>(key);

  if (!storedOtpHash) {
    return false;
  }

  const isValid = storedOtpHash === hashOtp(otp);
  if (isValid) {
    await redis.del(key);
  }

  return isValid;
};
