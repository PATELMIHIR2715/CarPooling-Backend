import { emailQueue, EMAIL_JOBS } from "../config/queue.js";
import { processEmailJob } from "./emailJobHandler.utils.js";

const enqueueEmailJob = async (jobName: string, data: any) => {
  try {
    await emailQueue.add(jobName, data);
  } catch (error) {
    console.error(
      `Email queue enqueue failed for ${jobName}. Sending directly.`,
      error
    );
    await processEmailJob(jobName, data);
  }
};

export const emailProducer = {
  sendWelcomeEmail: async (to: string, name: string, role: string) => {
    await enqueueEmailJob(EMAIL_JOBS.WELCOME, { to, name, role });
  },
  sendRegistrationOtpEmail: async (to: string, name: string, otp: string) => {
    await enqueueEmailJob(EMAIL_JOBS.REGISTRATION_OTP, { to, name, otp });
  },
  sendOtpEmail: async (to: string, name: string, otp: string) => {
    await enqueueEmailJob(EMAIL_JOBS.OTP, { to, name, otp });
  },
  sendTripStartEmail: async (
    to: string,
    name: string,
    driverName: string,
    origin: string,
    destination: string
  ) => {
    await enqueueEmailJob(EMAIL_JOBS.TRIP_STARTED, {
      to,
      name,
      driverName,
      origin,
      destination,
    });
  },
  sendBookingRequestEmail: async (
    to: string,
    driverName: string,
    passengerName: string,
    origin: string,
    destination: string,
    departureTime: string,
    seats: number
  ) => {
    await enqueueEmailJob(EMAIL_JOBS.BOOKING_REQUEST, {
      to,
      driverName,
      passengerName,
      origin,
      destination,
      departureTime,
      seats,
    });
  },
  sendBookingConfirmationEmail: async (
    to: string,
    passengerName: string,
    driverName: string,
    origin: string,
    destination: string,
    departureTime: string
  ) => {
    await enqueueEmailJob(EMAIL_JOBS.BOOKING_CONFIRMATION, {
      to,
      passengerName,
      driverName,
      origin,
      destination,
      departureTime,
    });
  },
  sendBookingRejectionEmail: async (
    to: string,
    passengerName: string,
    origin: string,
    destination: string
  ) => {
    await enqueueEmailJob(EMAIL_JOBS.BOOKING_REJECT, {
      to,
      passengerName,
      origin,
      destination,
    });
  },
  sendTripReminderEmail: async (to: string, name: string) => {
    await enqueueEmailJob(EMAIL_JOBS.TRIP_REMINDER, { to, name });
  },

  sendBookingPaymentEmail: async (
    to: string,
    passengerName: string,
    driverName: string,
    origin: string,
    destination: string,
    departureTime: string
  ) => {
    await enqueueEmailJob(EMAIL_JOBS.BOOKING_AMOUNT_RECEIVED, {
      to,
      passengerName,
      driverName,
      origin,
      destination,
      departureTime,
    });
  },
};
