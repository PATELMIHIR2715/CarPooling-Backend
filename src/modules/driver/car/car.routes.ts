import { Router } from "express";

import { ADD_CAR, DOCUMENTS, GET_MY_CARS } from "../../../constants/routes.js";
import { authenticate, authorize } from "../../auth/auth.middleware.js";
import carController from "./car.controller.js";
import { upload } from "../../../config/multer.js";
import {
  DRIVER_ROLE,
  LICENCE_FIELD,
  RC_FIELD,
} from "../../../constants/labels.js";

const router = Router();

router.post(
  ADD_CAR,
  authenticate,
  authorize([DRIVER_ROLE]),
  carController.addCar
);

router.get(
  GET_MY_CARS,
  authenticate,
  authorize([DRIVER_ROLE]),
  carController.getMyCar
);

router.post(
  DOCUMENTS,
  authenticate,
  authorize([DRIVER_ROLE]),
  upload.fields([
    { name: LICENCE_FIELD, maxCount: 1 },
    { name: RC_FIELD, maxCount: 1 },
  ]),
  carController.storeDocuments
);

router.get(
  DOCUMENTS,
  authenticate,
  authorize([DRIVER_ROLE]),
  carController.getDocuments
);

export default router;
