import { z } from "zod";

export const searchTripSchema = z.object({
  origin: z.object({
    lat: z.string(),
    lon: z.string(),
    name: z.string(),
  }),
  destination: z.object({
    lat: z.string(),
    lon: z.string(),
    name: z.string(),
  }),
  dateAndTime: z.string(),
  seats: z.number().min(1).max(6),
});

export const bookTripSchema = z.object({
  seats: z.number().min(1).max(6),
  pickupLocation: z.string(),
  dropoffLocation: z.string(),
});

export type SearchTripInput = z.infer<typeof searchTripSchema>;
export type BookTripInput = z.infer<typeof bookTripSchema>;
