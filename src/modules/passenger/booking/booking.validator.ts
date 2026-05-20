import { CANCELLED, COMPLETED } from "../../../constants/labels.js";
import {
  ALREADY_IN_WAITLIST,
  BOOKING_ALREADY_CANCELLED,
  BOOKINGS_NOT_FOUND,
  SEATS_AVAILABLE,
  TRIP_COMPLETED,
  UNAUTHORIZED_CANCEL,
} from "../../../constants/messages.js";

class PassengerBookingValidator {
  validateCancelBooking(booking: any, userId: string) {
    if (booking.passengerId !== userId) {
      throw new Error(UNAUTHORIZED_CANCEL);
    }
    if (booking.status === COMPLETED) {
      throw new Error(TRIP_COMPLETED);
    }
    if (booking.status === CANCELLED) {
      throw new Error(BOOKING_ALREADY_CANCELLED);
    }
  }
  validateBooking(booking: any) {
    if (!booking) {
      throw new Error(BOOKINGS_NOT_FOUND);
    }
  }
  validateWaitlistEntry(trip: any, userId: string) {
    if (trip.availableSeats > 0) {
      throw new Error(SEATS_AVAILABLE);
    }
    if (
      trip.waitingLists.some(
        (entry: { passengerId: string }) => entry.passengerId === userId
      )
    ) {
      throw new Error(ALREADY_IN_WAITLIST);
    }
  }
}

export default new PassengerBookingValidator();
