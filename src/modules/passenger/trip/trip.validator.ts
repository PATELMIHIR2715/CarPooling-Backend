import { z } from "zod";

const locationSchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  name: z.string().min(1),
});

export const searchTripSchema = z.object({
  origin: locationSchema,
  destination: locationSchema,
  dateAndTime: z.string(),
  seats: z.number().min(1).max(6),
});

export const bookTripSchema = z.object({
  seats: z.number().min(1).max(6),
  pickupLocation: locationSchema,
  dropoffLocation: locationSchema,
});

export type SearchTripInput = z.infer<typeof searchTripSchema>;
export type BookTripInput = z.infer<typeof bookTripSchema>;
