import crypto from "crypto";
import redis from "../config/redis.js";
import { PICKUP_OTP_KEY_PREFIX } from "../constants/labels.js";

const generateKey = (tripId: string, passengerId: string) =>
  `${PICKUP_OTP_KEY_PREFIX}:${tripId}:${passengerId}`;
const OTP_TTL_SECONDS = 10 * 60;
const hashOtp = (otp: string) =>
  crypto.createHash("sha256").update(otp).digest("hex");
export const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const storeOTP = async (
  tripId: string,
  passengerId: string,
  otp: string
) => {
  const key = generateKey(tripId, passengerId);
  await redis.set(key, hashOtp(otp));
  await redis.expire(key, OTP_TTL_SECONDS);
};

export const verifyOTP = async (
  tripId: string,
  passengerId: string,
  otp: string
) => {
  const key = generateKey(tripId, passengerId);
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

export const deleteOTP = async (tripId: string, passengerId: string) => {
  const key = generateKey(tripId, passengerId);
  await redis.del(key);
};
