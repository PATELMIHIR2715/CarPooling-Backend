import prisma from "../../../config/database.js";
import {
  BOOKINGS_NOT_FOUND,
  UNAUTHORIZED_ACCESS,
} from "../../../constants/messages.js";

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
      include: { ride: { select: { driverId: true } } },
    });

    if (userId !== booking?.ride.driverId) {
      throw new Error(UNAUTHORIZED_ACCESS);
    }

    const result = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return result;
  }
}

export default new BookingService();
