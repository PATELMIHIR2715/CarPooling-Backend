import crypto from "crypto";
import redis from "../config/redis.js";
import { REGISTRATION_OTP_KEY_PREFIX } from "../constants/labels.js";

const REGISTRATION_OTP_TTL_SECONDS = 10 * 60;

const generateKey = (email: string) =>
  `${REGISTRATION_OTP_KEY_PREFIX}:${email.toLowerCase().trim()}`;
const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

// In-memory fallback in case Redis quota is exceeded or Redis is offline
const memoryRegistrationOtpStore = new Map<string, { hash: string; expiresAt: number }>();

export const generateRegistrationOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const storeRegistrationOtp = async (email: string, otp: string) => {
  const key = generateKey(email);
  const hashed = hashOtp(otp);

  try {
    await redis.set(key, hashed);
    await redis.expire(key, REGISTRATION_OTP_TTL_SECONDS);
  } catch (error) {
    console.warn(
      `[RegistrationOTP] Redis store failed (${(error as any)?.message}). Using in-memory fallback.`
    );
    memoryRegistrationOtpStore.set(key, {
      hash: hashed,
      expiresAt: Date.now() + REGISTRATION_OTP_TTL_SECONDS * 1000,
    });
  }
};

export const verifyRegistrationOtp = async (email: string, otp: string) => {
  const key = generateKey(email);
  let storedOtpHash: string | null = null;

  try {
    storedOtpHash = await redis.get<string>(key);
  } catch (error) {
    console.warn(
      `[RegistrationOTP] Redis get failed (${(error as any)?.message}). Checking memory fallback.`
    );
  }

  // Fallback to in-memory store if Redis returned null or errored
  if (!storedOtpHash) {
    const memEntry = memoryRegistrationOtpStore.get(key);
    if (memEntry && memEntry.expiresAt > Date.now()) {
      storedOtpHash = memEntry.hash;
    }
  }

  if (!storedOtpHash) {
    return false;
  }

  const isValid = storedOtpHash === hashOtp(otp);
  if (isValid) {
    try {
      await redis.del(key);
    } catch (_) {}
    memoryRegistrationOtpStore.delete(key);
  }

  return isValid;
};
