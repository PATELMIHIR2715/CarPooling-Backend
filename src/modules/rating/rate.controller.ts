import { errorResponse } from "../../utils/error.utils.js";
import type { Response } from "express";
import RatingService from "./rate.service.js";
import { RateDto } from "./rate.validator.js";

class RatingController {
  async submitRating(req: any, res: Response) {
    try {
      const { tripId } = req.params;
      const userId = req.user.userId;
      const { rating, comment } = req.body;
      const rateDto = RateDto.parse({ rating, comment });

      const rate = await RatingService.submitRating(
        tripId,
        userId,
        rateDto.rating,
        rateDto.comment || null
      );
      res.status(200).json(rate);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new RatingController();
