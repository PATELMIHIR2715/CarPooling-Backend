import type { Response } from "express";

import { errorResponse } from "../../../utils/error.utils.js";
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

class CarController {
  async addCar(req: any, res: Response) {
    try {
      const driverId = req.user.userId;
      const data: CreateCar = createCarSchema.parse({ ...req.body, driverId });
      if (!data) {
        throw new Error(INVALID_INPUT);
      }
      const result = await CarService.createCar(data, driverId);
      res.status(201).json(result);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async getMyCar(req: any, res: Response) {
    try {
      const driverId = req.user.userId;
      const cars = await CarService.getCarsByDriver(driverId);
      if (!cars) {
        return res.status(404).json({ error: NO_CARS_FOUND });
      }
      console.log(cars);
      res.status(200).json(cars);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async storeDocuments(req: any, res: Response) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files["licence"] || !files["rc"]) {
        return res.status(400).json({ error: ALL_DOCUMENTS_REQUIRED });
      }

      const licenseFile = files["licence"] && files["licence"][0];
      const rcFile = files["rc"] && files["rc"][0];
      if (!licenseFile || !rcFile) {
        return errorResponse(new Error(DOCUMENTS_REQUIRED), res, 400);
      }
      const userId = req.user.userId;

      const licenseUrl = await uploadToCloudinary(
        licenseFile.buffer,
        "documents/drivers",
        `${userId}_license`
      );
      const rcUrl = await uploadToCloudinary(
        rcFile.buffer,
        "documents/drivers",
        `${userId}_rc`
      );
      const result = await CarService.uploadDocument(userId, licenseUrl, rcUrl);
      res.status(201).json(result);
    } catch (error) {
      errorResponse(error, res);
    }
  }

  async getDocuments(req: any, res: Response) {
    try {
      const document = await CarService.getDucumentsByDriver(req.user.userId);
      if (!document) {
        return errorResponse(new Error(NO_DOCUMENTS_FOUND), res, 404);
      }
      res.status(200).json(document);
    } catch (error) {
      errorResponse(error, res);
    }
  }
}

export default new CarController();
