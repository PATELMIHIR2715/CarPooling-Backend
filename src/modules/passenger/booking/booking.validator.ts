import { CANCELLED, COMPLETED } from "../../../constants/labels.js";

class PassengerBookingValidator {
  validateCancelBooking(booking: any, userId: string) {
    if (!booking) {
      throw new Error("Booking not found");
    }
    if (booking.passengerId !== userId) {
      throw new Error("Unauthorized to cancel this booking");
    }
    if (booking.status === COMPLETED) {
      throw new Error("Cannot cancel a completed booking");
    }
    if (booking.status === CANCELLED) {
      throw new Error("Booking is already cancelled");
    }
  }
  validateBooking(booking: any) {
    if (!booking) {
      throw new Error("Booking not found");
    }
  }
}

export default new PassengerBookingValidator();
