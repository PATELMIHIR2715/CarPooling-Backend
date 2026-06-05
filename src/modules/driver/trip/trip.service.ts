import { Prisma, type Ride } from "@prisma/client";

import prisma from "../../../config/database.js";
import { CANCELLED, COMPLETED, ONGOING } from "../../../constants/labels.js";
import {
  OVERLAP_TRIP,
  TRIP_COMPLETED,
  TRIP_NOT_FOUND,
  UNAUTHORIZED_ACCESS,
} from "../../../constants/messages.js";
import {
  validateSendOtp,
  validateStartTrip,
  validateVerifyOtp,
  type CreateTrip,
} from "./trip.validator.js";
import { emailProducer } from "../../../utils/emailProducer.utils.js";
import { generateOTP, storeOTP, verifyOTP } from "../../../utils/otp.utils.js";

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
      pickupLocations: (data.pickupLocations ?? []) as Prisma.InputJsonValue[],
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

  async startTrip(tripId: string, userId: string) {
    const trip = await prisma.ride.findUnique({
      where: { id: tripId },
      include: { driver: true, bookings: { include: { passenger: true } } },
    });

    if (!trip) {
      throw new Error(TRIP_NOT_FOUND);
    }
    validateStartTrip(trip, userId);

    const result = await prisma.ride.update({
      where: { id: tripId },
      data: { status: ONGOING },
    });

    for (const b of trip.bookings) {
      await emailProducer.sendTripStartEmail(
        b.passenger.email,
        b.passenger.name,
        trip.driver.name,
        trip.origin,
        trip.destinationLocation
      );
    }

    return result;
  }

  async sendPickupOtp(tripId: string, bookingId: string, driverId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        passenger: { select: { email: true, name: true } },
        ride: { select: { driverId: true } },
      },
    });

    if (!booking) {
      throw new Error(TRIP_NOT_FOUND);
    }
    validateSendOtp(booking, driverId);

    const otp = generateOTP();
    storeOTP(tripId, booking.passengerId, otp);

    await emailProducer.sendOtpEmail(
      booking.passenger.email,
      booking.passenger.name,
      otp
    );
    return { message: "OTP sent successfully" };
  }

  async verifyPickupOtp(
    tripId: string,
    bookingId: string,
    otp: string,
    driverId: string
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        passenger: { select: { email: true, name: true } },
        ride: { select: { driverId: true } },
      },
    });

    if (!booking) {
      throw new Error(TRIP_NOT_FOUND);
    }
    validateVerifyOtp(booking, driverId);
    const valid = await verifyOTP(tripId, booking.passengerId, otp);
    if (!valid) {
      throw new Error("Invalid OTP");
    }

    return await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "PICKEDUP" },
    });
  }
}

export default new TripService();
