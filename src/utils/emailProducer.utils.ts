import { emailQueue, EMAIL_JOBS } from "../config/queue.js";

export const emailProducer = {
  sendWelcomeEmail: async (to: string, name: string, role: string) => {
    emailQueue.add(EMAIL_JOBS.WELCOME, { to, name, role });
  },
  sendRegistrationOtpEmail: async (to: string, name: string, otp: string) => {
    emailQueue.add(EMAIL_JOBS.REGISTRATION_OTP, { to, name, otp });
  },
  sendOtpEmail: async (to: string, name: string, otp: string) => {
    emailQueue.add(EMAIL_JOBS.OTP, { to, name, otp });
  },
  sendTripStartEmail: async (
    to: string,
    name: string,
    driverName: string,
    origin: string,
    destination: string
  ) => {
    emailQueue.add(EMAIL_JOBS.TRIP_STARTED, {
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
    emailQueue.add(EMAIL_JOBS.BOOKING_REQUEST, {
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
    emailQueue.add(EMAIL_JOBS.BOOKING_CONFIRMATION, {
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
    driverName: string
  ) => {
    emailQueue.add(EMAIL_JOBS.BOOKING_REJECT, {
      to,
      passengerName,
      driverName,
    });
  },
  sendTripReminderEmail: async (to: string, name: string) => {
    emailQueue.add(EMAIL_JOBS.TRIP_REMINDER, { to, name });
  },

  sendBookingPaymentEmail: async (
    to: string,
    passengerName: string,
    driverName: string,
    origin: string,
    destination: string,
    departureTime: string
  ) => {
    emailQueue.add(EMAIL_JOBS.BOOKING_AMOUNT_RECEIVED, {
      to,
      passengerName,
      driverName,
      origin,
      destination,
      departureTime,
    });
  },
};
