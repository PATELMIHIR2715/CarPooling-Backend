import { Router } from "express";
import AdminTripsController from "./trips.controller.js";
import { authenticate, authorize } from "../../auth/auth.middleware.js";
import { ADMIN_ROLE } from "../../../constants/labels.js";
import { TRIPS } from "../../../constants/routes.js";

const router = Router();

router.post(
  TRIPS,
  authenticate,
  authorize([ADMIN_ROLE]),
  AdminTripsController.getAllTrips
);

export default router;
