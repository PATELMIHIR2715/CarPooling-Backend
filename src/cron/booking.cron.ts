import cron from "node-cron";
import prisma from "../config/database.js";
import { CANCELLED, COMPLETED, ONGOING, PENDING } from "../constants/labels.js";

export const startBookingCron = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      await prisma.booking.updateMany({
        where: {
          ride: { status: { in: [COMPLETED, CANCELLED] } },
          status: PENDING,
        },
        data: { status: CANCELLED },
      });
      console.log(
        "Booking entries cleaned up by cron job at",
        new Date().toISOString()
      );
    } catch (error) {
      console.error("Error starting booking cron job:", error);
    }
  });
  console.log("Booking cron job started");
};
