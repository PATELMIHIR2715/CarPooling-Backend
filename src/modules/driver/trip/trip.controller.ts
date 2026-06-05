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

  async startTrip(req: any, res: Response) {
    try {
      const tripId = req.params.tripId;
      const userId = req.user.userId;
      const trip = await tripService.startTrip(tripId, userId);
      res.status(200).json(trip);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async sendPickupOtp(req: any, res: Response) {
    try {
      const tripId = req.params.tripId;
      const userId = req.user.userId;
      const bookingId = req.params.bookingId;

      const trip = await tripService.sendPickupOtp(tripId, bookingId, userId);
      res.status(200).json(trip);
    } catch (error) {
      errorResponse(error, res);
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
      res.status(200).json(trip);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new TripController();
