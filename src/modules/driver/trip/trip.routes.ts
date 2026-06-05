import { Router } from "express";
import { BOOKINGID, ROOT, TRIPID } from "../../../constants/routes.js";
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
  TRIPID,
  authenticate,
  authorize([DRIVER_ROLE]),
  tripController.getTripById
);

router.put(
  `${TRIPID}/start`,
  authenticate,
  authorize([DRIVER_ROLE]),
  tripController.startTrip
);

router.post(
  `${TRIPID}/pickup${BOOKINGID}`,
  authenticate,
  authorize([DRIVER_ROLE]),
  tripController.sendPickupOtp
);

router.post(
  `${TRIPID}${BOOKINGID}/verify-otp`,
  authenticate,
  authorize([DRIVER_ROLE]),
  tripController.verifyOtp
);

export default router;
