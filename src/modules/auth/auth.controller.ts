import type { Request, Response } from "express";

import env from "../../config/env.js";
import {
  NODE_ENV_PRODUCTION,
  REFRESH_TOKEN_COOKIE,
  SAME_SITE_LAX,
  SAME_SITE_NONE,
} from "../../constants/labels.js";
import {
  loginSchema,
  registerSchema,
  sendRegistrationOtpSchema,
  type LoginInput,
  type RegisterInput,
  type SendRegistrationOtpInput,
} from "./auth.validator.js";
import { INVALID_INPUT } from "../../constants/messages.js";
import AuthService from "./auth.service.js";
import {
  successResponse,
  errorResponseStandard,
} from "../../utils/response.utils.js";

class AuthController {
  async sendRegistrationOtp(req: Request, res: Response) {
    try {
      const data: SendRegistrationOtpInput = sendRegistrationOtpSchema.parse(
        req.body
      );
      const result = await AuthService.sendRegistrationOtp(data);

      successResponse(res, result, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async register(req: Request, res: Response) {
    try {
      const data: RegisterInput = registerSchema.parse(req.body);

      if (!data) {
        throw new Error(INVALID_INPUT);
      }

      const result = await AuthService.registerUser(data);

      res.cookie(REFRESH_TOKEN_COOKIE, result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === NODE_ENV_PRODUCTION,
        sameSite:
          env.NODE_ENV === NODE_ENV_PRODUCTION ? SAME_SITE_NONE : SAME_SITE_LAX,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      successResponse(res, result, 201);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: LoginInput = loginSchema.parse(req.body);

      if (!data) {
        throw new Error(INVALID_INPUT);
      }

      const result = await AuthService.loginUser(data);

      res.cookie(REFRESH_TOKEN_COOKIE, result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === NODE_ENV_PRODUCTION,
        sameSite:
          env.NODE_ENV === NODE_ENV_PRODUCTION ? SAME_SITE_NONE : SAME_SITE_LAX,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      successResponse(res, result, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const result: string = await AuthService.refreshAccessToken(
        req.body.refreshToken as string
      );

      successResponse(res, { accessToken: result }, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new AuthController();
