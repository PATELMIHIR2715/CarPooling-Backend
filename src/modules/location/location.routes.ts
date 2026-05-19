import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import locationController from "./location.controller.js";
import { ROUTE, SEARCH } from "../../constants/routes.js";
import { DRIVER_ROLE, PASSENGER_ROLE } from "../../constants/labels.js";

const router = Router();

router.get(
  SEARCH,
  authenticate,
  authorize([DRIVER_ROLE, PASSENGER_ROLE]),
  locationController.search
);

router.post(
  ROUTE,
  authenticate,
  authorize([DRIVER_ROLE, PASSENGER_ROLE]),
  locationController.getRoutePoints
);

export default router;
