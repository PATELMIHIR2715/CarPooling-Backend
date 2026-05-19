import { z } from "zod";

export const createCarSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string(),
  seater: z.number(),
  licensePlate: z.string(),
  rcNumber: z.string(),
  driverId: z.string(),
});

export const updateCarSchema = z.object({
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  color: z.string().optional(),
  seater: z.number().optional(),
  licensePlate: z.string().optional(),
  rcNumber: z.string().optional(),
});

export type CreateCar = z.infer<typeof createCarSchema>;
