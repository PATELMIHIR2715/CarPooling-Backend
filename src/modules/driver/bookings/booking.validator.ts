import { z } from "zod";
import {
  ACCEPTED,
  CANCELLED,
  COMPLETED,
  PENDING,
  REJECTED,
} from "../../../constants/labels.js";
import { INVALID_STATUS } from "../../../constants/messages.js";

export const bookingStatusSchema = z.object({
  status: z.enum(
    [PENDING, ACCEPTED, REJECTED, CANCELLED, COMPLETED],
    { message: INVALID_STATUS }
  ),
});
export type BookingStatus = z.infer<typeof bookingStatusSchema>;
