import type { Response } from "express";
import AdminTripService from "./trips.service.js";
import { errorResponse } from "../../../utils/error.utils.js";

class AdminTripsController {
  async getAllTrips(req: any, res: Response) {
    try {
      const trips = await AdminTripService.getAllTrips(req.body);
      res.status(200).json(trips);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new AdminTripsController();
