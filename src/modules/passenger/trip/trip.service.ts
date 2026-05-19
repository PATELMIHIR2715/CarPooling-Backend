import prisma from "../../../config/database.js";
import { CANCELLED, COMPLETED } from "../../../constants/labels.js";
import type { BookTripInput, SearchTripInput } from "./trip.validator.js";

class TripService {
  async getTripsBySearch(data: SearchTripInput) {
    const trips = await prisma.ride.findMany({
      where: {
        AND: [
          { status: { notIn: [CANCELLED, COMPLETED] } },
          { availableSeats: { gte: data.seats ?? 1 } },
          { departureTime: { gte: new Date(data.dateAndTime) } },

          {
            OR: [
              { origin: { contains: data.origin.name, mode: "insensitive" } },
              { pickupLocations: { has: data.origin.name } },
            ],
          },
          {
            OR: [
              {
                destinationLocation: {
                  contains: data.destination.name,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      include: {
        driver: { select: { name: true, email: true, phone: true } },
        car: true,
      },
    });
    return trips;
  }
  async bookTrip(bookingData: BookTripInput, userId: string, tripId: string) {
    const trip = await prisma.ride.findUnique({
      where: { id: tripId },
    });
    const currentBookings = await prisma.booking.aggregate({
      where: { tripId, passengerId: userId },
      _sum: { seatBooked: true },
    });

    if (!trip) {
      throw new Error("Trip not found");
    }
    if (currentBookings) {
      throw new Error("You have already booked this trip");
    }
    if (trip.availableSeats < bookingData.seats) {
      throw new Error("Not enough seats available");
    }
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          tripId: trip.id as string,
          passengerId: userId,
          price: trip.price * bookingData.seats,
          seatBooked: bookingData.seats,
          dropoffLocation: bookingData.dropoffLocation,
          pickupLocation: bookingData.pickupLocation,
        },
      }),
      prisma.ride.update({
        where: { id: trip.id as string },
        data: { availableSeats: trip.availableSeats - bookingData.seats },
      }),
    ]);
    return booking;
  }
}

export default new TripService();
