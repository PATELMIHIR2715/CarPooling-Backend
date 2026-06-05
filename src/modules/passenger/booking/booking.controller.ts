import type { Response } from "express";

import passengerBookingService from "./booking.service.js";
import {
  errorResponseStandard,
  successResponse,
} from "../../../utils/response.utils.js";

class PassengerBookingController {
  async getAllBookings(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const bookings = await passengerBookingService.getAllBookings(userId);
      successResponse(res, { bookings }, 200);
    } catch (error) {
      errorResponseStandard(error, res, 500);
    }
  }

  async cancelBooking(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const bookingId = req.params.bookingId;
      const cancelledBooking = await passengerBookingService.cancelBooking(
        bookingId,
        userId
      );
      successResponse(res, { booking: cancelledBooking }, 200);
    } catch (error) {
      errorResponseStandard(error, res, 500);
    }
  }

  async joinWaitlist(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const tripId = req.params.tripId;
      const bookingData = req.body;
      const waitlistEntry = await passengerBookingService.joinWaitlist(
        tripId,
        userId,
        bookingData
      );
      successResponse(res, { waitlistEntry }, 201);
    } catch (error) {
      errorResponseStandard(error, res, 500);
    }
  }
}

export default new PassengerBookingController();
