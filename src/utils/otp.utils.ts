import redis from "../config/redis.js";

const generateKey = (tripId: string, passengerId: string) =>
  `otp:${tripId}:${passengerId}`;
export const generateOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const storeOTP = async (
  tripId: string,
  passengerId: string,
  otp: string
) => {
  const key = generateKey(tripId, passengerId);
  await redis.set(key, otp);
};

export const verifyOTP = async (
  tripId: string,
  passengerId: string,
  otp: string
) => {
  const key = generateKey(tripId, passengerId);
  const redisOTP = await redis.get(key);
  if (!redisOTP) {
    return false;
  }
  const isValid = redisOTP === otp;
  if (isValid) {
    await redis.del(key);
  }
  return isValid;
};

export const deleteOTP = async (tripId: string, passengerId: string) => {
  const key = generateKey(tripId, passengerId);
  await redis.del(key);
};
