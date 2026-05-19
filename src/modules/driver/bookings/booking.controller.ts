import type { Response } from "express";
import bookingService from "./booking.service.js";
import { errorResponse } from "../../../utils/error.utils.js";
import { bookingStatusSchema } from "./booking.validator.js";

class BookingController {
  async getBookingsByTripId(req: any, res: Response) {
    try {
      const tripId = req.params.tripid;
      const userId = req.user.userId;

      const bookings = await bookingService.getBookingByTrip(tripId, userId);
      res.status(200).json(bookings);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async updateTripStatus(req: any, res: Response) {
    const bookingId = req.params.bookingid;
    const status = req.params.status;
    const userId = req.user.userId;
    try {
      const bookingStatus = bookingStatusSchema.parse({
        status,
      });
      const result = await bookingService.updateBookingStatus(
        bookingId,
        bookingStatus.status,
        userId
      );
      res.status(200).json(result);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new BookingController();
