import cron from "node-cron";

import { COMPLETED, ONGOING, SCHEDULED } from "../constants/labels.js";
import prisma from "../config/database.js";

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
      console.log("Trip status updated by cron job at", now.toISOString());
    } catch (error) {
      console.error("Error starting trip cron job:", error);
    }
  });
  console.log("Trip cron job started");
};
