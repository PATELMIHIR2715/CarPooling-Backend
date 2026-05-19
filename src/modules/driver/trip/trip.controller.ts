import type { Response } from "express";

import { errorResponse } from "../../../utils/error.utils.js";
import { INVALID_INPUT } from "../../../constants/messages.js";
import { createTripShema, type CreateTrip } from "./trip.validator.js";
import tripService from "./trip.service.js";

class TripController {
  async createTrip(req: any, res: Response) {
    try {
      const driverId = req.user.userId;
      const data: CreateTrip = createTripShema.parse({ ...req.body });
      if (!data) {
        throw new Error(INVALID_INPUT);
      }
      const trip = await tripService.createTrip(driverId, data);
      res.status(201).json(trip);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async getTripsByDriver(req: any, res: Response) {
    try {
      const driverId = req.user.userId;
      const trips = await tripService.getTripsByDriver(driverId);
      res.status(200).json(trips);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async getTripById(req: any, res: Response) {
    try {
      const tripId = req.params.tripid;
      const trip = await tripService.getTripById(tripId);
      res.status(200).json(trip);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new TripController();
