import type { Response } from "express";
import AdminTripService from "./trips.service.js";
import {
  successResponse,
  errorResponseStandard,
} from "../../../utils/response.utils.js";

class AdminTripsController {
  async getAllTrips(req: any, res: Response) {
    try {
      const trips = await AdminTripService.getAllTrips(req.body);
      successResponse(res, trips, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new AdminTripsController();
