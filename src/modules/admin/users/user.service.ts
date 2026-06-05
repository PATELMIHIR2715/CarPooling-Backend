import type { Prisma, Role } from "@prisma/client";

import prisma from "../../../config/database.js";
import { USER_NOT_FOUND, USERS_NOT_FOUND } from "../../../constants/messages.js";
import redis from "../../../config/redis.js";
import { RESTRICTED_USERS_SET } from "../../../constants/labels.js";
import {
  buildPaginationMeta,
  type FilterInput,
} from "../../../utils/buildquery.utils.js";

class AdminUserService {
  async getAllUsers(usersType: string, filters: any) {
    if (usersType) {
      const [users, total] = await prisma.$transaction([
        prisma.user.findMany({
          ...filters,
          where: {
            role: usersType.toUpperCase() as Role,
          },
        }),
        prisma.user.count({ where: filters.where }),
      ]);

      return {
        data: users,
        meta: buildPaginationMeta(
          total,
          Math.ceil(filters.skip / filters.take) + 1,
          filters.take
        ),
      };
    }
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany(filters),
      prisma.user.count({ where: filters.where }),
    ]);
    return {
      data: users,
      meta: buildPaginationMeta(
        total,
        Math.ceil(filters.skip / filters.take) + 1,
        filters.take
      ),
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(USERS_NOT_FOUND);
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
    await redis.sadd(RESTRICTED_USERS_SET, userId);

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
    await redis.srem(RESTRICTED_USERS_SET, userId);

    return updatedUser;
  }
}

export default new AdminUserService();
