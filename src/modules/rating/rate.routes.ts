import { Router } from "express";

import { authenticate, authorize } from "../auth/auth.middleware.js";
import { DRIVER_ROLE, PASSENGER_ROLE } from "../../constants/labels.js";
import RatingController from "./rate.controller.js";
import { TRIPID } from "../../constants/routes.js";

const router = Router();

router.post(
  TRIPID,
  authenticate,
  authorize([PASSENGER_ROLE, DRIVER_ROLE]),
  RatingController.submitRating
);

export default router;
