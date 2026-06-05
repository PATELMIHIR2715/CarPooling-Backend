import type { Response } from "express";
import tripService from "./trip.service.js";
import { bookTripSchema, searchTripSchema } from "./trip.validator.js";
import { buildFilterQuery } from "../../../utils/buildquery.utils.js";
import { TRIP_FILTERS } from "../../../filters/trip.filter.js";
import {
  errorResponseStandard,
  successResponse,
} from "../../../utils/response.utils.js";

class PassengerTripController {
  async getTripsBySearch(req: any, res: Response) {
    try {
      const data = searchTripSchema.parse(req.body);
      const filter = buildFilterQuery(req.body, TRIP_FILTERS);
      const trips = await tripService.getTripsBySearch(data, filter);
      successResponse(res, trips, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async bookTrip(req: any, res: Response) {
    try {
      const bookingData = req.body;
      const user = req.user;
      const tripId = req.params.tripId as string;

      const data = bookTripSchema.parse(bookingData);
      const booking = await tripService.bookTrip(data, user, tripId);
      successResponse(res, booking, 201);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new PassengerTripController();
