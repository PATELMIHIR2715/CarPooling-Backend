import { Router } from "express";

import authController from "./auth.controller.js";
import {
  LOGIN,
  REFRESH_TOKEN,
  REGISTER,
  SEND_REGISTRATION_OTP,
} from "../../constants/routes.js";

const router = Router();

router.post(SEND_REGISTRATION_OTP, authController.sendRegistrationOtp);

router.post(REGISTER, authController.register);

router.post(LOGIN, authController.login);

router.post(REFRESH_TOKEN, authController.refreshToken);

export default router;
