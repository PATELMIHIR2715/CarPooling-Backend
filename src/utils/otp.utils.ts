import crypto from "crypto";
import redis from "../config/redis.js";
import { PICKUP_OTP_KEY_PREFIX } from "../constants/labels.js";

const generateKey = (tripId: string, passengerId: string) =>
  `${PICKUP_OTP_KEY_PREFIX}:${tripId}:${passengerId}`;
const OTP_TTL_SECONDS = 10 * 60;
const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");

// In-memory fallback in case Redis quota is exceeded or Redis is offline
const memoryOtpStore = new Map<string, { hash: string; expiresAt: number }>();

export const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const storeOTP = async (
  tripId: string,
  passengerId: string,
  otp: string
) => {
  const key = generateKey(tripId, passengerId);
  const hashed = hashOtp(otp);

  try {
    await redis.set(key, hashed);
    await redis.expire(key, OTP_TTL_SECONDS);
  } catch (error) {
    console.warn(
      `[OTP] Redis store failed (${(error as any)?.message}). Using in-memory fallback.`
    );
    memoryOtpStore.set(key, {
      hash: hashed,
      expiresAt: Date.now() + OTP_TTL_SECONDS * 1000,
    });
  }
};

export const verifyOTP = async (
  tripId: string,
  passengerId: string,
  otp: string
) => {
  const key = generateKey(tripId, passengerId);
  let storedOtpHash: string | null = null;

  try {
    storedOtpHash = await redis.get<string>(key);
  } catch (error) {
    console.warn(
      `[OTP] Redis get failed (${(error as any)?.message}). Checking memory fallback.`
    );
  }

  // Fallback to in-memory store if not found in Redis or Redis failed
  if (!storedOtpHash) {
    const memEntry = memoryOtpStore.get(key);
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
    memoryOtpStore.delete(key);
  }
  return isValid;
};

export const deleteOTP = async (tripId: string, passengerId: string) => {
  const key = generateKey(tripId, passengerId);
  try {
    await redis.del(key);
  } catch (_) {}
  memoryOtpStore.delete(key);
};
