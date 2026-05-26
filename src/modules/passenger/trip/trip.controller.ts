import type { Response } from "express";
import { errorResponse } from "../../../utils/error.utils.js";
import tripService from "./trip.service.js";
import { bookTripSchema, searchTripSchema } from "./trip.validator.js";
import { buildFilterQuery } from "../../../utils/buildquery.utils.js";
import { TRIP_FILTERS } from "../../../filters/trip.filter.js";

class PassengerTripController {
  async getTripsBySearch(req: any, res: Response) {
    try {
      const data = searchTripSchema.parse(req.body);
      const filter = buildFilterQuery(req.body, TRIP_FILTERS);
      const trips = await tripService.getTripsBySearch(data, filter);
      res.status(200).json(trips);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async bookTrip(req: any, res: Response) {
    try {
      const bookingData = req.body;
      const user = req.user;
      const tripId = req.params.tripId as string;

      const data = bookTripSchema.parse(bookingData);
      const booking = await tripService.bookTrip(data, user, tripId);
      res.status(200).json(booking);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new PassengerTripController();
