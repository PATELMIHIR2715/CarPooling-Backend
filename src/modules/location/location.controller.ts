import type { Response } from "express";

import {
  errorResponseStandard,
  successResponse,
} from "../../utils/response.utils.js";
import locationService from "./location.service.js";
import type { TLocationPoint } from "../../constants/types.js";
import { INVALID_QUERY } from "../../constants/messages.js";

class LoactionController {
  async search(req: any, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return errorResponseStandard(new Error(INVALID_QUERY), res, 400);
      }
      const result = await locationService.searchLocations(query);
      successResponse(res, result, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async getRoutePoints(req: any, res: Response) {
    try {
      const start: TLocationPoint = req.body.start;
      const end: TLocationPoint = req.body.end;
      if (!start || !end) {
        return errorResponseStandard(new Error(INVALID_QUERY), res, 400);
      }
      const result = await locationService.getRoutePoints(start, end);
      successResponse(res, result, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new LoactionController();
