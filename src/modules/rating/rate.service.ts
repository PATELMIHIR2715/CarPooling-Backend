import prisma from "../../config/database.js";
import { TRIP_NOT_FOUND } from "../../constants/messages.js";
import { validateTrip } from "./rate.validator.js";

class RatingService {
  async submitRating(
    rideId: string,
    userId: string,
    rating: number,
    comment: string | null
  ) {
    const trip = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { bookings: true, reviews: true },
    });
    if (!trip) {
      throw new Error(TRIP_NOT_FOUND);
    }
    validateTrip(trip, userId);

    const rate = await prisma.review.create({
      data: {
        rideId,
        reviewerId: userId,
        revieweeId: trip.driverId,
        comment: comment,
        rating: rating,
      },
    });
    return rate;
  }
}

export default new RatingService();
