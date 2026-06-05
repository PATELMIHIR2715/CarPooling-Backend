import type { Response } from "express";
import dashboardService from "./dashboard.service.js";
import {
  errorResponseStandard,
  successResponse,
} from "../../../utils/response.utils.js";

class DashboardController {
  async getStats(req: any, res: Response) {
    try {
      const data = await dashboardService.getDashboardData();
      successResponse(res, data, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new DashboardController();
