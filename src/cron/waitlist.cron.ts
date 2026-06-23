import cron from "node-cron";
import prisma from "../config/database.js";
import {
  ACCEPTED,
  CANCELLED,
  COMPLETED,
  ONGOING,
  SCHEDULED,
  WAITING,
} from "../constants/labels.js";
import {
  WAITLIST_CRON_CLEANED,
  WAITLIST_CRON_ERROR,
  WAITLIST_CRON_STARTED,
} from "../constants/messages.js";
import {
  calculateRouteSegmentDistanceKm,
  findNearestRoutePointIndex,
  type LocationPoint,
} from "../utils/location.utils.js";

const BOOKING_THRESHOLD_KM = 2;

const isRoutePoint = (value: unknown): value is LocationPoint => {
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

const buildRideRoutePoints = (trip: {
  origin: string;
  originLat: number | null;
  originLon: number | null;
  destinationLocation: string;
  destinationLat: number | null;
  destinationLon: number | null;
  pickupLocations: unknown[];
}) => {
  const originPoint: LocationPoint = {
    name: trip.origin,
    lat: trip.originLat ?? 0,
    lon: trip.originLon ?? 0,
  };

  const pickupPoints = trip.pickupLocations.filter(isRoutePoint);
  const routePoints = [originPoint, ...pickupPoints];

  if (trip.destinationLat !== null && trip.destinationLon !== null) {
    routePoints.push({
      name: trip.destinationLocation,
      lat: trip.destinationLat,
      lon: trip.destinationLon,
    });
  }

  return routePoints;
};

export const startWaitlistCron = () => {
  cron.schedule("*/10 * * * *", async () => {
    try {
      await prisma.waitingList.deleteMany({
        where: {
          status: WAITING,
          ride: { status: { in: [COMPLETED, ONGOING, CANCELLED] } },
        },
      });

      const tripsWithSeats = await prisma.ride.findMany({
        where: {
          status: SCHEDULED,
          availableSeats: { gt: 0 },
          waitingLists: { some: { status: WAITING } },
        },
        include: {
          waitingLists: {
            where: { status: WAITING },
            orderBy: { createdAt: "asc" },
            include: { passenger: true },
          },
          car: true,
        },
      });

      for (const trip of tripsWithSeats) {
        const waitingListEntry = trip.waitingLists[0];
        if (!waitingListEntry) continue;
        let remainingSeats = trip.availableSeats;
        const routePoints = buildRideRoutePoints(trip);
        const pickupRoutePoints = routePoints.slice(
          0,
          Math.max(routePoints.length - 1, 1)
        );

        if (routePoints.length < 2) {
          continue;
        }

        for (const entry of trip.waitingLists) {
          if (remainingSeats <= 0) break;
          if (entry.seatsRequested > remainingSeats) continue;
          if (
            entry.pickupLat === null ||
            entry.pickupLon === null ||
            entry.dropoffLat === null ||
            entry.dropoffLon === null
          ) {
            continue;
          }

          const pickupMatch = findNearestRoutePointIndex(
            {
              name: entry.pickupLocation,
              lat: entry.pickupLat,
              lon: entry.pickupLon,
            },
            pickupRoutePoints,
            BOOKING_THRESHOLD_KM
          );
          const dropoffMatch = findNearestRoutePointIndex(
            {
              name: entry.dropoffLocation,
              lat: entry.dropoffLat,
              lon: entry.dropoffLon,
            },
            routePoints,
            BOOKING_THRESHOLD_KM
          );

          if (
            pickupMatch.index === null ||
            dropoffMatch.index === null ||
            dropoffMatch.index <= pickupMatch.index
          ) {
            continue;
          }

          const distanceKm = calculateRouteSegmentDistanceKm(
            routePoints,
            pickupMatch.index,
            dropoffMatch.index
          );
          const totalPrice =
            distanceKm * trip.pricePerKm * entry.seatsRequested;

          await prisma.$transaction([
            prisma.booking.create({
              data: {
                tripId: trip.id,
                passengerId: entry.passengerId,
                passengerName: entry.passenger.name,
                price: totalPrice,
                distanceKm,
                unitPricePerKm: trip.pricePerKm,
                seatBooked: entry.seatsRequested,
                pickupLocation: entry.pickupLocation,
                dropoffLocation: entry.dropoffLocation,
                status: ACCEPTED,
              },
            }),

            prisma.waitingList.update({
              where: { id: entry.id },
              data: { status: ACCEPTED },
            }),
            prisma.ride.update({
              where: { id: trip.id },
              data: {
                availableSeats: {
                  decrement: entry.seatsRequested,
                },
              },
            }),
          ]);
          remainingSeats -= entry.seatsRequested;
        }
      }

      console.log(
        WAITLIST_CRON_CLEANED,
        new Date().toISOString()
      );
    } catch (error) {
      console.error(WAITLIST_CRON_ERROR, error);
    }
  });
  console.log(WAITLIST_CRON_STARTED);
};
