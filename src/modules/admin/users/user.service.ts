import type { Prisma, Role } from "@prisma/client";

import prisma from "../../../config/database.js";
import { USER_NOT_FOUND } from "../../../constants/messages.js";
import redis from "../../../config/redis.js";

class AdminUserService {
  async getAllUsers(usersType: string, filters: Prisma.UserFindManyArgs) {
    if (usersType) {
      const users = await prisma.user.findMany({
        ...filters,
        where: {
          role: usersType.toUpperCase() as Role,
          ...filters.where,
        },
      });
      return users;
    }
    const users = await prisma.user.findMany(filters);
    return users;
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("Users not found");
    }
    return user;
  }

  async restrictUser(userId: string) {
    const updatedUser = await prisma.user
      .update({
        where: { id: userId },
        data: { verified: false, refreshToken: null },
      })
      .catch(() => {
        throw new Error(USER_NOT_FOUND);
      });

    // Add user ID to Redis set for restricted users
    await redis.sadd("restricted_users", userId);

    return updatedUser;
  }

  async unrestrictUser(userId: string) {
    const updatedUser = await prisma.user
      .update({
        where: { id: userId },
        data: { verified: true },
      })
      .catch(() => {
        throw new Error(USER_NOT_FOUND);
      });

    // Remove user ID from Redis set for restricted users
    await redis.srem("restricted_users", userId);

    return updatedUser;
  }
}

export default new AdminUserService();
