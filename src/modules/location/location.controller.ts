import type { Response } from "express";

import { errorResponse } from "../../utils/error.utils.js";
import locationService from "./location.service.js";
import type { TLocationPoint } from "../../constants/types.js";
import { INVALID_QUERY } from "../../constants/messages.js";

class LoactionController {
  async search(req: any, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.status(400).json({ error: INVALID_QUERY });
      }
      const result = await locationService.searchLocations(query);
      res.status(200).json(result);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async getRoutePoints(req: any, res: Response) {
    try {
      const start: TLocationPoint = req.body.start;
      const end: TLocationPoint = req.body.end;
      if (!start || !end) {
        res.status(400).json({ error: INVALID_QUERY });
      }
      const result = await locationService.getRoutePoints(start, end);
      res.status(200).json(result);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new LoactionController();
