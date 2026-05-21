import type { Response } from "express";
import { errorResponse } from "../../../utils/error.utils.js";
import AdminUserService from "./user.service.js";
import { buildQuery } from "../../../utils/buildquery.utils.js";

class AdminUserController {
  async getAllUsers(req: any, res: Response) {
    try {
      const usersType = req.query.type as string;
      const filters = buildQuery(req.body);

      const users = await AdminUserService.getAllUsers(usersType, filters);
      res.status(200).json({ users });
    } catch (error) {
      errorResponse(error, res);
    }
  }
  async getUserById(req: any, res: Response) {
    try {
      const userId = req.params.userId;
      const user = await AdminUserService.getUserById(userId);

      res.status(200).json({ user });
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async restrictUser(req: any, res: Response) {
    try {
      const userId = req.params.userId;
      const updatedUser = await AdminUserService.restrictUser(userId);
      res.status(200).json({ user: updatedUser });
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async unrestrictUser(req: any, res: Response) {
    try {
      const userId = req.params.userId;
      const updatedUser = await AdminUserService.unrestrictUser(userId);
      res.status(200).json({ user: updatedUser });
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new AdminUserController();
