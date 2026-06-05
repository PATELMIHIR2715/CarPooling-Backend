import type { Response } from "express";
import bookingService from "./booking.service.js";
import { bookingStatusSchema } from "./booking.validator.js";
import {
  successResponse,
  errorResponseStandard,
} from "../../../utils/response.utils.js";

class BookingController {
  async getBookingsByTripId(req: any, res: Response) {
    try {
      const tripId = req.params.tripId ?? req.params.tripid;
      const userId = req.user.userId;

      const bookings = await bookingService.getBookingByTrip(tripId, userId);
      successResponse(res, bookings, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async updateTripStatus(req: any, res: Response) {
    const bookingId = req.params.bookingId ?? req.params.bookingid;
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
      successResponse(res, result, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new BookingController();
