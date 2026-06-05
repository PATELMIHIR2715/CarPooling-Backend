import { Router } from "express";

import { authenticate, authorize } from "../../auth/auth.middleware.js";
import { ADMIN_ROLE } from "../../../constants/labels.js";
import {
  RESTRICT,
  ROOT,
  UNRESTRICT,
  USERID,
  USERS,
} from "../../../constants/routes.js";
import AdminUserController from "./user.controller.js";

const router = Router();

router.post(
  `${USERS}`,
  authenticate,
  authorize([ADMIN_ROLE]),
  AdminUserController.getAllUsers
);

router.get(
  `${USERS}${USERID}`,
  authenticate,
  authorize([ADMIN_ROLE]),
  AdminUserController.getUserById
);

router.put(
  `${USERID}${RESTRICT}`,
  authenticate,
  authorize([ADMIN_ROLE]),
  AdminUserController.restrictUser
);
router.put(
  `${USERID}${UNRESTRICT}`,
  authenticate,
  authorize([ADMIN_ROLE]),
  AdminUserController.unrestrictUser
);

export default router;
