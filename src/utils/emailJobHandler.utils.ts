import { EMAIL_JOBS } from "../config/queue.js";
import {
  EMAIL_SUBJECT_BOOKING_CONFIRMED,
  EMAIL_SUBJECT_BOOKING_REJECTED,
  EMAIL_SUBJECT_BOOKING_REQUEST,
  EMAIL_SUBJECT_OTP,
  EMAIL_SUBJECT_PAYMENT_RECEIVED,
  EMAIL_SUBJECT_REGISTRATION_OTP,
  EMAIL_SUBJECT_TRIP_STARTED,
  EMAIL_SUBJECT_WELCOME,
} from "../constants/messages.js";
import {
  bookingAcceptedTemplate,
  bookingRejectedTemplate,
  bookingRequestTemplate,
} from "../templates/booking.templet.js";
import { otpTemplate } from "../templates/otp.templet.js";
import { paymentReceivedTemplate } from "../templates/payment.templet.js";
import { registrationOtpTemplate } from "../templates/registration-otp.templet.js";
import { tripStartedTemplate } from "../templates/trip.templets.js";
import { welcomeTemplate } from "../templates/welcome.templet.js";
import { sendEmail } from "./email.utils.js";

export const processEmailJob = async (jobName: string, data: any) => {
  switch (jobName) {
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
      await sendEmail(data.to, EMAIL_SUBJECT_OTP, otpTemplate(data.name, data.otp));
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

    default:
      throw new Error(`Unknown email job: ${jobName}`);
  }
};
