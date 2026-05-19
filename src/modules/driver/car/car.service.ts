import prisma from "../../../config/database.js";
import { CAR_ALREADY_EXISTS } from "../../../constants/messages.js";
import { type CreateCar } from "./car.validator.js";

class CarService {
  async createCar(request: CreateCar, driverId: string) {
    const existing = await prisma.car.findUnique({
      where: {
        driverId: driverId,
      },
    });
    if (existing) {
      throw new Error(CAR_ALREADY_EXISTS);
    }
    const car = await prisma.car.create({
      data: {
        ...request,
        driverId,
      },
    });
    return car;
  }

  async getCarsByDriver(driverId: string) {
    const cars = await prisma.car.findUnique({
      where: {
        driverId,
      },
    });
    return cars;
  }

  async uploadDocument(userId: string, licenceurl: string, rcurl: string) {
    const existing = await prisma.document.findUnique({
      where: {
        userId,
      },
    });
    if (existing) {
      const document = await prisma.document.update({
        where: {
          userId,
        },
        data: {
          userId,
          licenceurl,
          rcurl,
        },
      });
      return document;
    } else {
      const document = await prisma.document.create({
        data: {
          userId,
          licenceurl,
          rcurl,
        },
      });
      return document;
    }
  }

  async getDucumentsByDriver(userId: string) {
    return await prisma.document.findUnique({
      where: {
        userId: userId,
      },
    });
  }
}

export default new CarService();
