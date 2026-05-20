import { Router } from "express";
import { authenticate, authorize } from "../../auth/auth.middleware.js";
import { PASSENGER_ROLE } from "../../../constants/labels.js";
import PassengerController from "./booking.controller.js";
import { BOOKINGID, BOOKINGS, CANCEL } from "../../../constants/routes.js";

const router = Router();

router.get(
  BOOKINGS,
  authenticate,
  authorize([PASSENGER_ROLE]),
  PassengerController.getAllBookings
);

router.put(
  `${BOOKINGS}${BOOKINGID}${CANCEL}`,
  authenticate,
  authorize([PASSENGER_ROLE]),
  PassengerController.cancelBooking
);

export default router;
