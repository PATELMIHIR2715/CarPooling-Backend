import { Router } from "express";
import { authenticate, authorize } from "../../auth/auth.middleware.js";
import { ADMIN_ROLE } from "../../../constants/labels.js";
import dashboardController from "./dashboard.controller.js";
import { ROOT, STATS } from "../../../constants/routes.js";

const router = Router();

router.get(
  STATS,
  authenticate,
  authorize([ADMIN_ROLE]),
  dashboardController.getStats
);

export default router;
