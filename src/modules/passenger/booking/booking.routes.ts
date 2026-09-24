import { Router } from "express";
import { authenticate, authorize } from "../../auth/auth.middleware.js";
import { PASSENGER_ROLE } from "../../../constants/labels.js";
import PassengerController from "./booking.controller.js";
import {
  BOOKINGID,
  BOOKINGS,
  CANCEL,
  ROOT,
  TRIPID,
  WAITLIST,
} from "../../../constants/routes.js";

const router = Router();

router.get(
  ROOT,
  authenticate,
  authorize([PASSENGER_ROLE]),
  PassengerController.getAllBookings
);

router.put(
  `${BOOKINGID}${CANCEL}`,
  authenticate,
  authorize([PASSENGER_ROLE]),
  PassengerController.cancelBooking
);

router.post(
  `${TRIPID}${WAITLIST}`,
  authenticate,
  authorize([PASSENGER_ROLE]),
  PassengerController.joinWaitlist
);

export default router;
