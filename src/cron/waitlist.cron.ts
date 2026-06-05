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
        },
      });

      for (const trip of tripsWithSeats) {
        const waitingListEntry = trip.waitingLists[0];
        if (!waitingListEntry) continue;
        let remainingSeats = trip.availableSeats;
        for (const entry of trip.waitingLists) {
          if (remainingSeats <= 0) break;
          if (entry.seatsRequested > remainingSeats) continue;
          await prisma.$transaction([
            prisma.booking.create({
              data: {
                tripId: trip.id,
                passengerId: entry.passengerId,
                price: trip.price * entry.seatsRequested,
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
