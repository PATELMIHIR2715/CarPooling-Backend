import prisma from "../../config/database.js";

class RatingService {
  async submitRating(
    rideId: string,
    userId: string,
    rating: number,
    comment: string
  ) {
    const trip = await prisma.ride.findUnique({
      where: { id: rideId },
      include: { bookings: true },
    });
    if (!trip) {
      throw new Error("Trip not found");
    }
    if (!trip.bookings.some((booking) => booking.passengerId === userId)) {
      throw new Error("Passenger is not associated with this trip");
    }
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
