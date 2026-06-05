import cron from "node-cron";
import prisma from "../config/database.js";
import { CANCELLED, COMPLETED, ONGOING, PENDING } from "../constants/labels.js";
import {
  BOOKING_CRON_CLEANED,
  BOOKING_CRON_ERROR,
  BOOKING_CRON_STARTED,
} from "../constants/messages.js";

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
        BOOKING_CRON_CLEANED,
        new Date().toISOString()
      );
    } catch (error) {
      console.error(BOOKING_CRON_ERROR, error);
    }
  });
  console.log(BOOKING_CRON_STARTED);
};
