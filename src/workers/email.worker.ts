import { Worker } from "bullmq";
import { sendEmail } from "../utils/email.utils.js";
import env from "../config/env.js";
import { EMAIL_JOBS } from "../config/queue.js";
import { welcomeTemplate } from "../templates/welcome.templet.js";
import { otpTemplate } from "../templates/otp.templet.js";
import { registrationOtpTemplate } from "../templates/registration-otp.templet.js";
import {
  bookingAcceptedTemplate,
  bookingRejectedTemplate,
  bookingRequestTemplate,
} from "../templates/booking.templet.js";
import { paymentReceivedTemplate } from "../templates/payment.templet.js";
import { tripStartedTemplate } from "../templates/trip.templets.js";
import { EMAIL_QUEUE_NAME } from "../constants/labels.js";
import {
  EMAIL_JOB_COMPLETED,
  EMAIL_JOB_COMPLETED_FOR,
  EMAIL_JOB_FAILED,
  EMAIL_SUBJECT_PAYMENT_RECEIVED,
  EMAIL_SUBJECT_BOOKING_CONFIRMED,
  EMAIL_SUBJECT_BOOKING_REJECTED,
  EMAIL_SUBJECT_BOOKING_REQUEST,
  EMAIL_SUBJECT_OTP,
  EMAIL_SUBJECT_REGISTRATION_OTP,
  EMAIL_SUBJECT_TRIP_STARTED,
  EMAIL_SUBJECT_WELCOME,
  EMAIL_WORKER_STARTED,
} from "../constants/messages.js";

const connection = {
  host: new URL(env.UPSTASH_REDIS_URL!).hostname,
  port: 6379,
  password: env.UPSTASH_REDIS_TOKEN,
  tls: {},
};

export const startEmailWorker = () => {
  const worker = new Worker(
    EMAIL_QUEUE_NAME,
    async (job) => {
      const { data } = job;

      switch (job.name) {
        case EMAIL_JOBS.WELCOME:
          await sendEmail(
            data.to,
            EMAIL_SUBJECT_WELCOME,
            welcomeTemplate(data.name, data.role)
          );
          break;
        case EMAIL_JOBS.REGISTRATION_OTP:
          await sendEmail(
            data.to,
            EMAIL_SUBJECT_REGISTRATION_OTP,
            registrationOtpTemplate(data.name, data.otp)
          );
          break;
        case EMAIL_JOBS.TRIP_STARTED:
          await sendEmail(
            data.to,
            EMAIL_SUBJECT_TRIP_STARTED,
            tripStartedTemplate(
              data.name,
              data.driverName,
              data.origin,
              data.destination
            )
          );
          break;
        case EMAIL_JOBS.OTP:
          await sendEmail(
            data.to,
            EMAIL_SUBJECT_OTP,
            otpTemplate(data.name, data.otp)
          );
          break;
        case EMAIL_JOBS.BOOKING_REQUEST:
          await sendEmail(
            data.to,
            EMAIL_SUBJECT_BOOKING_REQUEST,
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
            EMAIL_SUBJECT_BOOKING_CONFIRMED,
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
            EMAIL_SUBJECT_BOOKING_REJECTED,
            bookingRejectedTemplate(
              data.passengerName,
              data.origin,
              data.destination
            )
          );
          break;
        case EMAIL_JOBS.BOOKING_AMOUNT_RECEIVED:
          await sendEmail(
            data.to,
            EMAIL_SUBJECT_PAYMENT_RECEIVED,
            paymentReceivedTemplate(
              data.passengerName,
              data.driverName,
              data.origin,
              data.destination,
              data.departureTime
            )
          );
          break;
      }
      console.log(`${EMAIL_JOB_COMPLETED_FOR} ${job.name}: ${data.to}`);
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log(`${EMAIL_JOB_COMPLETED}: ${job.id}`);
  });

  worker.on("failed", (job, err) => {
    console.error(`${EMAIL_JOB_FAILED}: ${job?.id}: ${err.message}`);
  });
  console.log(EMAIL_WORKER_STARTED);

  return worker;
};
