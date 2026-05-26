import { Prisma } from "@prisma/client";

import prisma from "../../../config/database.js";
import { CANCELLED, COMPLETED } from "../../../constants/labels.js";
import { OVERLAP_TRIP, TRIP_NOT_FOUND } from "../../../constants/messages.js";
import type { CreateTrip } from "./trip.validator.js";

class TripService {
  async createTrip(driverId: string, data: CreateTrip) {
    const car = await prisma.car.findUnique({
      where: {
        driverId,
      },
    });
    const unAproovedDocuments = await prisma.document.findFirst({
      where: {
        userId: driverId,
        OR: [
          { rcStatus: { not: "APPROVED" } },
          { licenceStatus: { not: "APPROVED" } },
        ],
      },
    });

    if (unAproovedDocuments) {
      throw new Error("Your documents not approved");
    }

    if (!car) {
      throw new Error("Driver does not have a car registered");
    }
    const overLappingTrips = await prisma.ride.findFirst({
      where: {
        driverId,
        status: { notIn: [COMPLETED, CANCELLED] },
        AND: [
          { departureTime: { lte: new Date(data.endTime) } },
          { endTime: { gte: new Date(data.departureTime) } },
        ],
      },
    });

    if (overLappingTrips) {
      throw new Error(OVERLAP_TRIP);
    }

    const tripCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const payload = {
      tripcode: tripCode,
      carId: car.id,
      driverId,
      price: data.price,
      pickupLocations: (data.pickupLocations ??
        []) as Prisma.InputJsonValue[],
      destinationLocation: data.destination.name,
      destinationLat: data.destination.lat,
      destinationLon: data.destination.lon,
      endTime: new Date(data.endTime),
      origin: data.origin.name,
      originLat: data.origin.lat,
      originLon: data.origin.lon,
      departureTime: new Date(data.departureTime),
      availableSeats: data.availableSeats,
    };

    const trip = await prisma.ride.create({
      data: payload,
    });

    return trip;
  }

  async getTripsByDriver(driverId: string) {
    const trips = await prisma.ride.findMany({
      where: {
        driverId,
      },
    });

    return trips;
  }

  async getTripById(tripId: string) {
    const trip = await prisma.ride.findUnique({
      where: {
        id: tripId,
      },
      include: { bookings: true, car: true },
    });
    if (!trip) {
      throw new Error(TRIP_NOT_FOUND);
    }
    return trip;
  }
}

export default new TripService();
