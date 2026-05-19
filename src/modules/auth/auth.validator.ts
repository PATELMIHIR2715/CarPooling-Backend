import { z } from "zod";
import {
  ADMIN_ROLE,
  DRIVER_ROLE,
  PASSENGER_ROLE,
} from "../../constants/labels.js";
import {
  INVALID_EMAIL,
  NAME_TOO_SHORT,
  PASSWORD_TOO_SHORT,
  PASSWORD_WEAK,
  PHONE_NUMBER_TOO_SHORT,
  ROLE_MISMATCH,
} from "../../constants/messages.js";
import { PASSWORD_REGEX } from "../../constants/regex.js";

export const registerSchema = z.object({
  name: z.string().min(2, NAME_TOO_SHORT),
  email: z.string().email(INVALID_EMAIL),
  password: z
    .string()
    .min(8, PASSWORD_TOO_SHORT)
    .regex(PASSWORD_REGEX, PASSWORD_WEAK),
  role: z.enum([DRIVER_ROLE, PASSENGER_ROLE, ADMIN_ROLE], {
    message: ROLE_MISMATCH,
  }),
  phone: z.string().min(10, PHONE_NUMBER_TOO_SHORT),
});

export const loginSchema = z.object({
  email: z.string().email(INVALID_EMAIL),
  password: z.string().min(8, PASSWORD_TOO_SHORT),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
