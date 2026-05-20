import prisma from "../../../config/database.js";
import { CANCELLED } from "../../../constants/labels.js";
import {
  BOOKINGS_NOT_FOUND,
  TRIP_NOT_FOUND,
} from "../../../constants/messages.js";
import PassengerBookingValidator from "./booking.validator.js";

class PassengerBookingService {
  async getAllBookings(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: {
        passengerId: userId,
      },
      include: {
        ride: {
          include: {
            driver: { select: { name: true, email: true, phone: true } },
            car: { select: { make: true, model: true, color: true } },
          },
        },
      },
    });
    PassengerBookingValidator.validateBooking(bookings);

    return bookings;
  }
  async cancelBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    PassengerBookingValidator.validateCancelBooking(booking, userId);

    if (!booking) {
      throw new Error(BOOKINGS_NOT_FOUND);
    }

    const cancelledBooking = await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: CANCELLED },
      }),
      prisma.ride.update({
        where: { id: booking.tripId },
        data: { availableSeats: { increment: booking.seatBooked ?? 0 } },
      }),
    ]);

    return cancelledBooking;
  }

  async joinWaitlist(tripId: string, userId: string) {
    const trip = await prisma.ride.findUnique({
      where: { id: tripId },
      include: {
        waitingLists: { where: { passengerId: userId } },
        _count: {
          select: { waitingLists: true },
        },
      },
    });
    if (!trip) {
      throw new Error(TRIP_NOT_FOUND);
    }
    PassengerBookingValidator.validateWaitlistEntry(trip, userId);

    const waitList = await prisma.waitingList.create({
      data: {
        rideId: tripId,
        passengerId: userId,
        position: trip._count.waitingLists + 1,
      },
    });
    return waitList;
  }
}

export default new PassengerBookingService();
