import type { Response } from "express";
import dashboardService from "./dashboard.service.js";
import { errorResponse } from "../../../utils/error.utils.js";

class DashboardController {
  async getStats(req: any, res: Response) {
    try {
      const data = await dashboardService.getDashboardData();
      res.status(200).json(data);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new DashboardController();
