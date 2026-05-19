import type { Response } from "express";
import { errorResponse } from "../../../utils/error.utils.js";
import tripService from "./trip.service.js";
import { bookTripSchema, searchTripSchema } from "./trip.validator.js";

class PassengerTripController {
  async getTripsBySearch(req: any, res: Response) {
    try {
      const data = searchTripSchema.parse(req.body);
      const trips = await tripService.getTripsBySearch(data);
      res.status(200).json(trips);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async bookTrip(req: any, res: Response) {
    try {
      const bookingData = req.body;
      const userId = req.user.userId;
      const tripId = req.params.tripId as string;

      const data = bookTripSchema.parse(bookingData);
      const booking = await tripService.bookTrip(data, userId, tripId);
      res.status(200).json(booking);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new PassengerTripController();
