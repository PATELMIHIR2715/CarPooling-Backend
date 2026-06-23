import prisma from "../../../config/database.js";
import { CANCELLED, COMPLETED } from "../../../constants/labels.js";
import {
  NOT_ENOUGH_SEATS,
  PICKUP_DROPOFF_LOCATION_INVALID,
  PICKUP_DROPOFF_LOCATION_SAME,
  PICKUP_DROPOFF_ROUTE_SEQUENCE_INVALID,
  TRIP_ALREADY_BOOKED,
  TRIP_NOT_FOUND,
} from "../../../constants/messages.js";
import type { TUser } from "../../../constants/types.js";
import {
  calculateRouteSegmentDistanceKm,
  findNearestPickupPoint,
  findNearestRoutePointIndex,
  haversineDistance,
  type LocationPoint,
} from "../../../utils/location.utils.js";
import type { BookTripInput, SearchTripInput } from "./trip.validator.js";
import { buildPaginationMeta } from "../../../utils/buildquery.utils.js";

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

const getOriginPoint = (trip: {
  origin: string;
  originLat: number | null;
  originLon: number | null;
}): LocationPoint => ({
  name: trip.origin,
  lat: trip.originLat ?? 0,
  lon: trip.originLon ?? 0,
});

const buildRideRoutePoints = (trip: {
  origin: string;
  originLat: number | null;
  originLon: number | null;
  pickupLocations: unknown[];
  destinationLocation: string;
  destinationLat: number | null;
  destinationLon: number | null;
}) => {
  const originPoint = getOriginPoint(trip);
  const pickupPoints = toPickupPoints(trip.pickupLocations);
  const destinationPoint = getDestinationPoint(trip);

  return destinationPoint
    ? [originPoint, ...pickupPoints, destinationPoint]
    : [originPoint, ...pickupPoints];
};

class TripService {
  async getTripsBySearch(data: SearchTripInput, filter: any) {
    const baseWhere = {
      ...filter.where,
      AND: [
        { status: { notIn: [CANCELLED, COMPLETED] } },
        { availableSeats: { gte: data.seats ?? 1 } },
        { departureTime: { gte: new Date(data.dateAndTime) } },
      ],
    };
    const trips = await prisma.ride.findMany({
      where: baseWhere,
      orderBy: filter.orderBy,
      include: {
        driver: { select: { name: true, email: true, phone: true } },
        car: true,
      },
    });
    const filteredTrips = trips.filter((trip: any) => {
      const pickupPoints = toPickupPoints(trip.pickupLocations);
      const destinationPoint = getDestinationPoint(trip);

      if (!destinationPoint) {
        return false;
      }

      const allPickupPoints = [...pickupPoints, getOriginPoint(trip)];

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
    const paginatedTrips = filteredTrips.slice(
      filter.skip,
      filter.skip + filter.take
    );

    return {
      data: paginatedTrips,
      meta: buildPaginationMeta(
        filteredTrips.length,
        Math.ceil(filter.skip / filter.take) + 1,
        filter.take
      ),
    };
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

    const routePoints = buildRideRoutePoints(trip);
    const allPickupPoints = routePoints.slice(0, Math.max(routePoints.length - 1, 1));

    const isValidPickup = findNearestPickupPoint(
      bookingData.pickupLocation,
      allPickupPoints,
      BOOKING_THRESHOLD_KM
    ).isNear;

    const isValidDropoff = findNearestPickupPoint(
      bookingData.dropoffLocation,
      routePoints,
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

    const pickupMatch = findNearestRoutePointIndex(
      bookingData.pickupLocation,
      allPickupPoints,
      BOOKING_THRESHOLD_KM
    );
    const dropoffMatch = findNearestRoutePointIndex(
      bookingData.dropoffLocation,
      routePoints,
      BOOKING_THRESHOLD_KM
    );

    if (
      pickupMatch.index === null ||
      dropoffMatch.index === null ||
      dropoffMatch.index <= pickupMatch.index
    ) {
      throw new Error(PICKUP_DROPOFF_ROUTE_SEQUENCE_INVALID);
    }

    const distanceKm = calculateRouteSegmentDistanceKm(
      routePoints,
      pickupMatch.index,
      dropoffMatch.index
    );
    const pricePerSeat = distanceKm * trip.pricePerKm;
    const totalPrice = pricePerSeat * bookingData.seats;

    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          tripId: trip.id as string,
          passengerId: user.userId,
          price: totalPrice,
          distanceKm,
          unitPricePerKm: trip.pricePerKm,
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
