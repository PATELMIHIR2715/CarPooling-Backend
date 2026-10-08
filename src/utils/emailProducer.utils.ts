import { emailQueue, EMAIL_JOBS } from "../config/queue.js";
import { processEmailJob } from "./emailJobHandler.utils.js";
import {
  isDirectEmailModeEnabled,
  isUpstashLimitError,
  tripCircuit,
} from "./redisCircuitBreaker.utils.js";

const enqueueEmailJob = async (
  jobName: string,
  data: any,
  options: { priority?: number; lifo?: boolean } = {}
) => {
  // If direct sending mode is active or circuit breaker is tripped, bypass Redis completely
  if (isDirectEmailModeEnabled()) {
    try {
      await processEmailJob(jobName, data);
      return;
    } catch (directErr) {
      console.error(
        `Direct SMTP dispatch failed for ${jobName} to ${data?.to}:`,
        directErr
      );
      return;
    }
  }

  try {
    await emailQueue.add(jobName, data, options);
  } catch (error: any) {
    if (isUpstashLimitError(error)) {
      tripCircuit("Upstash Redis command quota exceeded during enqueue");
    }
    console.error(
      `Email queue enqueue failed for ${jobName}. Sending directly via SMTP fallback:`,
      error?.message || error
    );
    try {
      await processEmailJob(jobName, data);
    } catch (fallbackErr) {
      console.error(
        `Direct SMTP fallback failed for ${jobName} to ${data?.to}:`,
        fallbackErr
      );
    }
  }
};

export const emailProducer = {
  sendWelcomeEmail: async (to: string, name: string, role: string) => {
    await enqueueEmailJob(EMAIL_JOBS.WELCOME, { to, name, role });
  },

  // High-priority direct fast-path for time-sensitive registration OTPs
  sendRegistrationOtpEmail: async (to: string, name: string, otp: string) => {
    try {
      await processEmailJob(EMAIL_JOBS.REGISTRATION_OTP, { to, name, otp });
    } catch (err) {
      console.warn("Direct OTP send failed, falling back to BullMQ queue:", err);
      await enqueueEmailJob(
        EMAIL_JOBS.REGISTRATION_OTP,
        { to, name, otp },
        { priority: 1, lifo: true }
      );
    }
  },

  // High-priority direct fast-path for login OTPs
  sendOtpEmail: async (to: string, name: string, otp: string) => {
    try {
      await processEmailJob(EMAIL_JOBS.OTP, { to, name, otp });
    } catch (err) {
      console.warn("Direct OTP send failed, falling back to BullMQ queue:", err);
      await enqueueEmailJob(
        EMAIL_JOBS.OTP,
        { to, name, otp },
        { priority: 1, lifo: true }
      );
    }
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
