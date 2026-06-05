import { z } from "zod";
import { COMPLETED } from "../../constants/labels.js";
import {
  PASSRNGER_NOT_ASSOCIATED,
  RATING_ALREADY_SUBMITTED,
  TRIP_NOT_COMPLETED,
} from "../../constants/messages.js";

export const RateDto = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export type RateDtoType = z.infer<typeof RateDto>;

export function validateTrip(
  trip: { status: string; bookings: any[]; reviews: any[] },
  userId: string
) {
  if (!trip.bookings.some((booking) => booking.passengerId === userId)) {
    throw new Error(PASSRNGER_NOT_ASSOCIATED);
  }
  if (trip.status !== COMPLETED) {
    throw new Error(TRIP_NOT_COMPLETED);
  }
  if (trip.reviews.some((review) => review.reviewerId === userId)) {
    throw new Error(RATING_ALREADY_SUBMITTED);
  }
}
