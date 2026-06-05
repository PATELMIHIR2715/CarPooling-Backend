import type { Response } from "express";
import RatingService from "./rate.service.js";
import { RateDto } from "./rate.validator.js";
import {
  errorResponseStandard,
  successResponse,
} from "../../utils/response.utils.js";

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
      successResponse(res, rate, 201);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new RatingController();
