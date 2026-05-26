import { z } from "zod";

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
