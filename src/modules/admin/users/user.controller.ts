import type { Response } from "express";
import AdminUserService from "./user.service.js";
import { buildFilterQuery } from "../../../utils/buildquery.utils.js";
import { USER_FILTERS } from "../../../filters/user.filter.js";
import {
  successResponse,
  errorResponseStandard,
} from "../../../utils/response.utils.js";

class AdminUserController {
  async getAllUsers(req: any, res: Response) {
    try {
      const usersType = req.query.type as string;
      const filters = buildFilterQuery(req.body, USER_FILTERS);

      const users = await AdminUserService.getAllUsers(usersType, filters);
      successResponse(res, { users }, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
  async getUserById(req: any, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await AdminUserService.getUserById(userId);

      successResponse(res, { user }, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async restrictUser(req: any, res: Response) {
    try {
      const userId = req.params.userId;
      const updatedUser = await AdminUserService.restrictUser(userId);
      successResponse(res, { user: updatedUser }, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async unrestrictUser(req: any, res: Response) {
    try {
      const userId = req.params.userId;
      const updatedUser = await AdminUserService.unrestrictUser(userId);
      successResponse(res, { user: updatedUser }, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new AdminUserController();
