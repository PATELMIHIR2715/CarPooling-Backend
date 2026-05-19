import type { Request, Response } from "express";

import env from "../../config/env.js";
import { errorResponse } from "../../utils/error.utils.js";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from "./auth.validator.js";
import { INVALID_INPUT } from "../../constants/messages.js";
import AuthService from "./auth.service.js";

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RegisterInput = registerSchema.parse(req.body);

      if (!data) {
        throw new Error(INVALID_INPUT);
      }

      const result = await AuthService.registerUser(data);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(201).json(result);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: LoginInput = loginSchema.parse(req.body);

      if (!data) {
        throw new Error(INVALID_INPUT);
      }

      const result = await AuthService.loginUser(data);

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json(result);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const result: string = await AuthService.refreshAccessToken(
        req.body.refreshToken as string
      );

      res.status(200).json({ accessToken: result });
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new AuthController();
