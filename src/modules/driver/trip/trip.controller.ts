import type { Response } from "express";

import { INVALID_INPUT } from "../../../constants/messages.js";
import { createTripShema, type CreateTrip } from "./trip.validator.js";
import tripService from "./trip.service.js";
import {
  errorResponseStandard,
  successResponse,
} from "../../../utils/response.utils.js";

class TripController {
  async createTrip(req: any, res: Response) {
    try {
      const driverId = req.user.userId;
      const data: CreateTrip = createTripShema.parse({ ...req.body });
      if (!data) {
        throw new Error(INVALID_INPUT);
      }
      const trip = await tripService.createTrip(driverId, data);
      successResponse(res, trip, 201);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async getTripsByDriver(req: any, res: Response) {
    try {
      const driverId = req.user.userId;
      const trips = await tripService.getTripsByDriver(driverId);
      successResponse(res, trips, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async getTripById(req: any, res: Response) {
    try {
      const tripId = req.params.tripId ?? req.params.tripid;
      const trip = await tripService.getTripById(tripId);
      successResponse(res, trip, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async startTrip(req: any, res: Response) {
    try {
      const tripId = req.params.tripId;
      const userId = req.user.userId;
      const trip = await tripService.startTrip(tripId, userId);
      successResponse(res, trip, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async sendPickupOtp(req: any, res: Response) {
    try {
      const tripId = req.params.tripId;
      const userId = req.user.userId;
      const bookingId = req.params.bookingId;

      const trip = await tripService.sendPickupOtp(tripId, bookingId, userId);
      successResponse(res, trip, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async verifyOtp(req: any, res: Response) {
    try {
      const tripId = req.params.tripId;
      const bookingId = req.params.bookingId;
      const userId = req.user.userId;
      const otp = req.body.otp;
      const trip = await tripService.verifyPickupOtp(
        tripId,
        bookingId,
        otp,
        userId
      );
      successResponse(res, trip, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new TripController();
