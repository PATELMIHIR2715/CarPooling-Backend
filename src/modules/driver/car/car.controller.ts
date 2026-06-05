import type { Response } from "express";

import {
  errorResponseStandard,
  successResponse,
} from "../../../utils/response.utils.js";
import { createCarSchema, type CreateCar } from "./car.validator.js";
import CarService from "./car.service.js";
import { uploadToCloudinary } from "../../../utils/upload.utils.js";
import {
  ALL_DOCUMENTS_REQUIRED,
  DOCUMENTS_REQUIRED,
  INVALID_INPUT,
  NO_CARS_FOUND,
  NO_DOCUMENTS_FOUND,
} from "../../../constants/messages.js";
import {
  DRIVER_DOCUMENTS_FOLDER,
  LICENCE_FIELD,
  RC_FIELD,
} from "../../../constants/labels.js";

class CarController {
  async addCar(req: any, res: Response) {
    try {
      const driverId = req.user.userId;
      const data: CreateCar = createCarSchema.parse({ ...req.body, driverId });
      if (!data) {
        throw new Error(INVALID_INPUT);
      }
      const result = await CarService.createCar(data, driverId);
      successResponse(res, result, 201);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async getMyCar(req: any, res: Response) {
    try {
      const driverId = req.user.userId;
      const cars = await CarService.getCarsByDriver(driverId);
      if (!cars) {
        return errorResponseStandard(new Error(NO_CARS_FOUND), res, 404);
      }
      successResponse(res, cars, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async storeDocuments(req: any, res: Response) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files[LICENCE_FIELD] || !files[RC_FIELD]) {
        return errorResponseStandard(
          new Error(ALL_DOCUMENTS_REQUIRED),
          res,
          400
        );
      }

      const licenseFile = files[LICENCE_FIELD] && files[LICENCE_FIELD][0];
      const rcFile = files[RC_FIELD] && files[RC_FIELD][0];
      if (!licenseFile || !rcFile) {
        return errorResponseStandard(new Error(DOCUMENTS_REQUIRED), res, 400);
      }
      const userId = req.user.userId;

      const licenseUrl = await uploadToCloudinary(
        licenseFile.buffer,
        DRIVER_DOCUMENTS_FOLDER,
        `${userId}_license`
      );
      const rcUrl = await uploadToCloudinary(
        rcFile.buffer,
        DRIVER_DOCUMENTS_FOLDER,
        `${userId}_rc`
      );
      const result = await CarService.uploadDocument(userId, licenseUrl, rcUrl);
      successResponse(res, result, 201);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  async getDocuments(req: any, res: Response) {
    try {
      const document = await CarService.getDucumentsByDriver(req.user.userId);
      if (!document) {
        return errorResponseStandard(new Error(NO_DOCUMENTS_FOUND), res, 404);
      }
      successResponse(res, document, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }
}

export default new CarController();
