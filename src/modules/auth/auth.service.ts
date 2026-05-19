import bcrypt from "bcryptjs";

import prisma from "../../config/database.js";
import {
  generateTokens,
  generateAccessToken,
  verifyRefreshToken,
} from "../../utils/jwt.utils.js";
import {
  EMAIL_ALREADY_EXISTS,
  INVALID_LOGIN_CREDENTIALS,
  INVALID_REFRESH_TOKEN,
} from "../../constants/messages.js";
import type { RegisterInput, LoginInput } from "./auth.validator.js";

class AuthService {
  async registerUser(request: RegisterInput) {
    const { email, password, name, phone, role } = request;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new Error(EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        phone,
        password: hashedPassword,
      },
    });
    const tokens = generateTokens(user.id, role, user.name);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: tokens.refreshToken,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  async loginUser(request: LoginInput) {
    const { email, password } = request;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error(INVALID_LOGIN_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error(INVALID_LOGIN_CREDENTIALS);
    }

    const tokens = generateTokens(user.id, user.role, user.name);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: tokens.refreshToken,
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens,
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken) as {
      userId: string;
      role: string;
      name: string;
    };
    const { userId, role, name } = decoded;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error(INVALID_REFRESH_TOKEN);
    }

    const accessToken = generateAccessToken(userId, role, name);
    return accessToken;
  }
}

export default new AuthService();
