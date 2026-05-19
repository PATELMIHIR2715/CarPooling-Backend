import prisma from "../../../config/database.js";
import { CANCELLED, COMPLETED } from "../../../constants/labels.js";
import {
  NOT_ENOUGH_SEATS,
  PICKUP_DROPOFF_LOCATION_INVALID,
  PICKUP_DROPOFF_LOCATION_SAME,
  TRIP_ALREADY_BOOKED,
  TRIP_NOT_FOUND,
} from "../../../constants/messages.js";
import type { TUser } from "../../../constants/types.js";
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
  async bookTrip(bookingData: BookTripInput, user: TUser, tripId: string) {
    const trip = await prisma.ride.findUnique({
      where: { id: tripId },
    });
    const currentBookings = await prisma.booking.aggregate({
      where: { AND: [{ tripId }, { passengerId: user.userId }] },
      _sum: { seatBooked: true },
    });

    if (!trip) {
      throw new Error(TRIP_NOT_FOUND);
    }

    // Already booked
    if ((currentBookings._sum.seatBooked ?? 0) > 0) {
      throw new Error(TRIP_ALREADY_BOOKED);
    }

    // Seat validation
    if (trip.availableSeats < bookingData.seats) {
      throw new Error(NOT_ENOUGH_SEATS);
    }

    // Valid locations
    const validLocations = [...trip.pickupLocations, trip.destinationLocation];

    // Pickup validation
    const isValidPickup = validLocations.includes(bookingData.pickupLocation);

    // Dropoff validation
    const isValidDropoff = validLocations.includes(bookingData.dropoffLocation);

    // Same pickup & dropoff check
    const isSameLocation =
      bookingData.pickupLocation === bookingData.dropoffLocation;

    if (!isValidPickup || !isValidDropoff) {
      throw new Error(PICKUP_DROPOFF_LOCATION_INVALID);
    }

    if (isSameLocation) {
      throw new Error(PICKUP_DROPOFF_LOCATION_SAME);
    }
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          tripId: trip.id as string,
          passengerId: user.userId,
          price: trip.price * bookingData.seats,
          passengerName: user.name,
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
