import { Router } from "express";

import authController from "./auth.controller.js";
import { LOGIN, REFRESH_TOKEN, REGISTER } from "../../constants/routes.js";

const router = Router();

router.post(REGISTER, authController.register);

router.post(LOGIN, authController.login);

router.post(REFRESH_TOKEN, authController.refreshToken);

export default router;
