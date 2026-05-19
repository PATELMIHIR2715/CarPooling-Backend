import { Router } from "express";
import { authenticate, authorize } from "../../auth/auth.middleware.js";
import { DRIVER_ROLE } from "../../../constants/labels.js";
import bookingController from "./booking.controller.js";

const router = Router();

router.get(
  `/:tripid`,
  authenticate,
  authorize([DRIVER_ROLE]),
  bookingController.getBookingsByTripId
);

router.put(
  `/:bookingid/:status`,
  authenticate,
  authorize([DRIVER_ROLE]),
  bookingController.updateTripStatus
);

export default router;
