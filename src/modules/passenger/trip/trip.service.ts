import prisma from "../../../config/database.js";
import { CANCELLED, COMPLETED } from "../../../constants/labels.js";
import {
  NOT_ENOUGH_SEATS,
  PICKUP_DROPOFF_LOCATION_INVALID,
  PICKUP_DROPOFF_LOCATION_SAME,
  TRIP_ALREADY_BOOKED,
  TRIP_NOT_FOUND,
} from "../../../constants/messages.js";
import type { TUser } from "../../../constants/types.js";
import {
  findNearestPickupPoint,
  haversineDistance,
  type LocationPoint,
} from "../../../utils/location.utils.js";
import type { BookTripInput, SearchTripInput } from "./trip.validator.js";

const SEARCH_THRESHOLD_KM = 5;
const BOOKING_THRESHOLD_KM = 2;
const SAME_LOCATION_THRESHOLD_KM = 0.5;

const isLocationPoint = (value: unknown): value is LocationPoint => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const point = value as Partial<LocationPoint>;
  return (
    typeof point.name === "string" &&
    typeof point.lat === "number" &&
    typeof point.lon === "number"
  );
};

const toPickupPoints = (pickupLocations: unknown[]): LocationPoint[] =>
  pickupLocations.filter(isLocationPoint);

const getDestinationPoint = (trip: {
  destinationLocation: string;
  destinationLat: number | null;
  destinationLon: number | null;
}): LocationPoint | null => {
  if (trip.destinationLat === null || trip.destinationLon === null) {
    return null;
  }

  return {
    name: trip.destinationLocation,
    lat: trip.destinationLat,
    lon: trip.destinationLon,
  };
};

class TripService {
  async getTripsBySearch(data: SearchTripInput) {
    const trips = await prisma.ride.findMany({
      where: {
        AND: [
          { status: { notIn: [CANCELLED, COMPLETED] } },
          { availableSeats: { gte: data.seats ?? 1 } },
          { departureTime: { gte: new Date(data.dateAndTime) } },
        ],
      },
      include: {
        driver: { select: { name: true, email: true, phone: true } },
        car: true,
      },
    });
    return trips.filter((trip) => {
      const pickupPoints = toPickupPoints(trip.pickupLocations);
      const destinationPoint = getDestinationPoint(trip);

      if (!destinationPoint) {
        return false;
      }

      const allPickupPoints = [
        ...pickupPoints,
        {
          name: trip.origin,
          lat: trip.originLat ?? 0,
          lon: trip.originLon ?? 0,
        },
      ];

      const originMatch = findNearestPickupPoint(
        data.origin,
        allPickupPoints,
        SEARCH_THRESHOLD_KM
      ).isNear;
      const destinationMatch =
        haversineDistance(
          data.destination.lat,
          data.destination.lon,
          destinationPoint.lat,
          destinationPoint.lon
        ) <= SEARCH_THRESHOLD_KM;

      return originMatch && destinationMatch;
    });
  }
  async bookTrip(bookingData: BookTripInput, user: TUser, tripId: string) {
    const trip = await prisma.ride.findUnique({
      where: { id: tripId },
    });
    const currentBookings = await prisma.booking.aggregate({
      where: { AND: [{ tripId }, { passengerId: user.userId }] },
      _sum: { seatBooked: true },
    });

    if (!trip) {
      throw new Error(TRIP_NOT_FOUND);
    }

    // Already booked
    if ((currentBookings._sum.seatBooked ?? 0) > 0) {
      throw new Error(TRIP_ALREADY_BOOKED);
    }

    // Seat validation
    if (trip.availableSeats < bookingData.seats) {
      throw new Error(NOT_ENOUGH_SEATS);
    }

    const pickupPoints = toPickupPoints(trip.pickupLocations);

    const allPickupPoints = [
      ...pickupPoints,
      {
        name: trip.origin,
        lat: trip.originLat ?? 0,
        lon: trip.originLon ?? 0,
      },
    ];
    const destinationPoint = getDestinationPoint(trip);
    const dropoffPoints = destinationPoint
      ? [...allPickupPoints, destinationPoint]
      : allPickupPoints;

    const isValidPickup = findNearestPickupPoint(
      bookingData.pickupLocation,
      allPickupPoints,
      BOOKING_THRESHOLD_KM
    ).isNear;

    const isValidDropoff = findNearestPickupPoint(
      bookingData.dropoffLocation,
      dropoffPoints,
      BOOKING_THRESHOLD_KM
    ).isNear;

    const isSameLocation =
      haversineDistance(
        bookingData.pickupLocation.lat,
        bookingData.pickupLocation.lon,
        bookingData.dropoffLocation.lat,
        bookingData.dropoffLocation.lon
      ) < SAME_LOCATION_THRESHOLD_KM;

    if (!isValidPickup || !isValidDropoff) {
      throw new Error(PICKUP_DROPOFF_LOCATION_INVALID);
    }

    if (isSameLocation) {
      throw new Error(PICKUP_DROPOFF_LOCATION_SAME);
    }
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          tripId: trip.id as string,
          passengerId: user.userId,
          price: trip.price * bookingData.seats,
          passengerName: user.name,
          seatBooked: bookingData.seats,
          dropoffLocation: bookingData.dropoffLocation.name,
          pickupLocation: bookingData.pickupLocation.name,
        },
      }),
      prisma.ride.update({
        where: { id: trip.id as string },
        data: { availableSeats: trip.availableSeats - bookingData.seats },
      }),
    ]);
    return booking;
  }
}

export default new TripService();
