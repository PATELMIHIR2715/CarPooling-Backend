import prisma from "../../../config/database.js";
import { CANCELLED } from "../../../constants/labels.js";
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
    const cancelledBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: CANCELLED },
    });

    return cancelledBooking;
  }
}

export default new PassengerBookingService();
