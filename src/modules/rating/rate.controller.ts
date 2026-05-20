import { errorResponse } from "../../utils/error.utils.js";
import type { Response } from "express";
import RatingService from "./rate.service.js";

class RatingController {
  async submitRating(req: any, res: Response) {
    try {
      const { rideId } = req.params;
      const userId = req.user.userId;
      const { rating, comment } = req.body;
      const rate = await RatingService.submitRating(
        rideId,
        userId,
        rating,
        comment
      );
      res.status(200).json(rate);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new RatingController();
