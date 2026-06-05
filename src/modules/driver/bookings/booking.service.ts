import prisma from "../../../config/database.js";
import { ACCEPTED, REJECTED } from "../../../constants/labels.js";
import {
  BOOKINGS_NOT_FOUND,
  UNAUTHORIZED_ACCESS,
} from "../../../constants/messages.js";
import { emailProducer } from "../../../utils/emailProducer.utils.js";

class BookingService {
  async getBookingByTrip(tripId: string, userId: string) {
    const bookings = await prisma.booking.findMany({
      where: { tripId },
      include: {
        ride: { select: { driverId: true } },
        passenger: {
          select: { name: true, email: true, phone: true },
        },
      },
    });

    if (userId !== bookings[0]?.ride?.driverId) {
      throw new Error(UNAUTHORIZED_ACCESS);
    }
    if (!bookings.length) {
      throw new Error(BOOKINGS_NOT_FOUND);
    }
    return bookings;
  }

  async updateBookingStatus(bookingId: string, status: any, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        passenger: { select: { email: true, name: true } },
        ride: {
          select: {
            driverId: true,
            origin: true,
            destinationLocation: true,
            departureTime: true,
            driver: { select: { name: true } },
          },
        },
      },
    });

    if (userId !== booking?.ride.driverId) {
      throw new Error(UNAUTHORIZED_ACCESS);
    }

    if (!booking) {
      throw new Error(BOOKINGS_NOT_FOUND);
    }

    const result = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (status === ACCEPTED) {
      await emailProducer.sendBookingConfirmationEmail(
        booking.passenger.email,
        booking.passenger.name,
        booking.ride.driver.name,
        booking.ride.origin,
        booking.ride.destinationLocation,
        booking.ride.departureTime.toISOString()
      );
    } else if (status === REJECTED) {
      await emailProducer.sendBookingRejectionEmail(
        booking.passenger.email,
        booking.passenger.name,
        booking.ride.driver.name
      );
    }

    return result;
  }
}

export default new BookingService();
