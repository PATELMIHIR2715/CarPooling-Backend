import { Router } from "express";
import tripController from "./trip.controller.js";
import { BOOK, GET_TRIPS, TRIPID } from "../../../constants/routes.js";
import { authenticate, authorize } from "../../auth/auth.middleware.js";
import { PASSENGER_ROLE } from "../../../constants/labels.js";

const router = Router();

router.post(
  GET_TRIPS,
  authenticate,
  authorize([PASSENGER_ROLE]),
  tripController.getTripsBySearch
);

router.post(
  `${TRIPID}${BOOK}`,
  authenticate,
  authorize([PASSENGER_ROLE]),
  tripController.bookTrip
);

export default router;
