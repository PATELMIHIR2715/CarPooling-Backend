import { Router } from "express";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import locationController from "./location.controller.js";

const router = Router();

router.get(
  "/search",
  authenticate,
  authorize(["DRIVER", "PASSENGER"]),
  locationController.search
);

router.post(
  "/route",
  authenticate,
  authorize(["DRIVER", "PASSENGER"]),
  locationController.getRoutePoints
);

export default router;
