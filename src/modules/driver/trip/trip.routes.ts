import { Router } from "express";
import { BOOKINGS, ROOT } from "../../../constants/routes.js";
import { authenticate, authorize } from "../../auth/auth.middleware.js";
import tripController from "./trip.controller.js";
import { DRIVER_ROLE } from "../../../constants/labels.js";

const router = Router();

router.post(
  ROOT,
  authenticate,
  authorize([DRIVER_ROLE]),
  tripController.createTrip
);

router.get(
  ROOT,
  authenticate,
  authorize([DRIVER_ROLE]),
  tripController.getTripsByDriver
);

router.get(
  `/:tripid`,
  authenticate,
  authorize([DRIVER_ROLE]),
  tripController.getTripById
);

export default router;
