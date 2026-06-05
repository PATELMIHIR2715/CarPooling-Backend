import { Worker } from "bullmq";
import { sendEmail } from "../utils/email.utils.js";
import env from "../config/env.js";
import { EMAIL_JOBS } from "../config/queue.js";
import { welcomeTemplate } from "../templates/welcome.templet.js";
import { otpTemplate } from "../templates/otp.templet.js";
import {
  bookingAcceptedTemplate,
  bookingRejectedTemplate,
  bookingRequestTemplate,
} from "../templates/booking.templet.js";
import { tripStartedTemplate } from "../templates/trip.templets.js";

const connection = {
  host: new URL(env.UPSTASH_REDIS_URL!).hostname,
  port: 6379,
  password: env.UPSTASH_REDIS_TOKEN,
  tls: {},
};

export const startEmailWorker = () => {
  const worker = new Worker(
    "email",
    async (job) => {
      const { data } = job;

      switch (job.name) {
        case EMAIL_JOBS.WELCOME:
          await sendEmail(
            data.to,
            "Welcome to Carpooling App!",
            welcomeTemplate(data.name, data.role)
          );
          break;
        case EMAIL_JOBS.TRIP_STARTED:
          await sendEmail(
            data.to,
            "Your Trip Has Started! 🚗",
            tripStartedTemplate(
              data.name,
              data.driverName,
              data.origin,
              data.destination
            )
          );
        case EMAIL_JOBS.OTP:
          await sendEmail(
            data.to,
            "Your OTP Code",
            otpTemplate(data.name, data.otp)
          );
          break;
        case EMAIL_JOBS.BOOKING_REQUEST:
          await sendEmail(
            data.to,
            "New Booking Request",
            bookingRequestTemplate(
              data.driverName,
              data.passengerName,
              data.origin,
              data.destination,
              data.departureTime,
              data.seats
            )
          );
          break;
        case EMAIL_JOBS.BOOKING_CONFIRMATION:
          await sendEmail(
            data.to,
            "Booking Confirmed! 🎉",
            bookingAcceptedTemplate(
              data.passengerName,
              data.driverName,
              data.origin,
              data.destination,
              data.departureTime
            )
          );
          break;
        case EMAIL_JOBS.BOOKING_REJECT:
          await sendEmail(
            data.to,
            "Booking Rejected",
            bookingRejectedTemplate(
              data.passengerName,
              data.origin,
              data.destination
            )
          );
          break;
      }
      console.log(`Email job ${job.name} completed for ${data.to}`);
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log(`Email job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Email job ${job?.id} failed: ${err.message}`);
  });
  console.log("Email worker started");

  return worker;
};
