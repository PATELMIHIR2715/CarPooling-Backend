import type { Response } from "express";

import { errorResponse } from "../../../utils/error.utils.js";
import passengerBookingService from "./booking.service.js";

class PassengerBookingController {
  async getAllBookings(req: any, res: Response) {
    try {
      const userId = req.user.userId;
      const bookings = await passengerBookingService.getAllBookings(userId);
      res.status(200).json({ bookings });
    } catch (error) {
      errorResponse(error, res, 500);
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
      res.status(200).json({ booking: cancelledBooking });
    } catch (error) {
      errorResponse(error, res, 500);
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
      res.status(200).json({ waitlistEntry });
    } catch (error) {
      errorResponse(error, res, 500);
    }
  }
}

export default new PassengerBookingController();
