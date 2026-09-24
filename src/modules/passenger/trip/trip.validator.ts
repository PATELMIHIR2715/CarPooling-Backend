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

export const feedTripSchema = z.object({
  currentLocation: locationSchema,
  radiusKm: z.coerce.number().min(1).max(50).default(5),
  seats: z.coerce.number().min(1).max(6).default(1),
  pagination: z
    .object({
      page: z.coerce.number().min(1).optional(),
      limit: z.coerce.number().min(1).max(100).optional(),
    })
    .optional(),
});

export const bookTripSchema = z.object({
  seats: z.number().min(1).max(6),
  pickupLocation: locationSchema,
  dropoffLocation: locationSchema,
});

export type SearchTripInput = z.infer<typeof searchTripSchema>;
export type FeedTripInput = z.infer<typeof feedTripSchema>;
export type BookTripInput = z.infer<typeof bookTripSchema>;
