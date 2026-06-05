import cron from "node-cron";

import { COMPLETED, ONGOING, SCHEDULED } from "../constants/labels.js";
import prisma from "../config/database.js";
import {
  TRIP_CRON_ERROR,
  TRIP_CRON_STARTED,
  TRIP_STATUS_CRON_UPDATED,
} from "../constants/messages.js";

export const startTripCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      await prisma.ride.updateMany({
        where: { status: SCHEDULED, departureTime: { lte: now } },
        data: { status: ONGOING },
      });

      await prisma.ride.updateMany({
        where: { status: ONGOING, endTime: { lte: now } },
        data: { status: COMPLETED },
      });
      console.log(TRIP_STATUS_CRON_UPDATED, now.toISOString());
    } catch (error) {
      console.error(TRIP_CRON_ERROR, error);
    }
  });
  console.log(TRIP_CRON_STARTED);
};
