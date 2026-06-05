import { z } from "zod";
import {
  TRIP_COMPLETED,
  TRIP_NOT_FOUND,
  UNAUTHORIZED_ACCESS,
} from "../../../constants/messages.js";
import { COMPLETED } from "../../../constants/labels.js";

const locationSchema = z.object({
  name: z.string().min(2),
  lat: z.coerce.number(),
  lon: z.coerce.number(),
});

export const createTripShema = z.object({
  price: z.number().min(1),
  pickupLocations: z.array(locationSchema).min(0).optional(),
  destination: locationSchema,
  endTime: z.string(),
  origin: locationSchema,
  departureTime: z.string(),
  availableSeats: z.number().min(1).max(6),
});

export type CreateTrip = z.infer<typeof createTripShema>;

export const validateStartTrip = (trip: any, userId: string) => {
  if (trip.driverId !== userId) {
    throw new Error(UNAUTHORIZED_ACCESS);
  }
  if (!trip) {
    throw new Error(TRIP_NOT_FOUND);
  }
  if (trip.status !== "SCHEDULED") {
    throw new Error("Trip is not scheduled");
  }
};

export const validateSendOtp = (booking: any, userId: string) => {
  if (booking.status === COMPLETED) {
    throw new Error(TRIP_COMPLETED);
  }
  if (userId !== booking?.ride.driverId) {
    throw new Error(UNAUTHORIZED_ACCESS);
  }
};

export const validateVerifyOtp = (booking: any, userId: string) => {
  if (booking.status === COMPLETED) {
    throw new Error(TRIP_COMPLETED);
  }
  if (userId !== booking?.ride.driverId) {
    throw new Error(UNAUTHORIZED_ACCESS);
  }
};
