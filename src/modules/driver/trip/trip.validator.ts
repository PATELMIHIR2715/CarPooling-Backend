import { z } from "zod";

export const createTripShema = z.object({
  price: z.number().min(1),
  pickupLocations: z.array(z.string()).min(0).optional(),
  destinationLocation: z.string(),
  endTime: z.string().optional(),
  origin: z.string().min(2),
  departureTime: z.string(),
  availableSeats: z.number().min(1).max(6),
});

export type CreateTrip = z.infer<typeof createTripShema>;
