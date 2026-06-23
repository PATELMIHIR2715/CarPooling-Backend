import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/client";
import type { Response } from "express";
import { ZodError } from "zod";
import {
  ALREADY_EXISTS,
  ALREADY_IN_WAITLIST,
  BOOKING_ACCESS_DENIED,
  BOOKING_ALREADY_CANCELLED,
  BOOKING_NOT_FOUND,
  BOOKINGS_NOT_FOUND,
  CAR_ALREADY_EXISTS,
  COD_PAYMENT_MODE,
  COD_REFUND_NOT_ALLOWED,
  CHAT_ACCESS_DENIED,
  DATABASE_ERROR,
  DOCUMENTS_NOT_APPROVED,
  DRIVER_CAR_NOT_FOUND,
  EMAIL_ALREADY_EXISTS,
  FORBIDDEN,
  INTERNAL_SERVER_ERROR,
  INVALID_SIGNATURE,
  INVALID_OTP,
  INVALID_WEBHOOK_SIGNATURE,
  INVALID_DATABASE_DATA,
  INVALID_FIELD,
  INVALID_LOGIN_CREDENTIALS,
  INVALID_REFRESH_TOKEN,
  INVALID_REFERENCE,
  NOT_ENOUGH_SEATS,
  PAYMENT_ALREADY_MADE,
  PAYMENT_ID_NOT_FOUND,
  PAYMENT_NOT_MADE,
  RECORD_NOT_FOUND,
  SEATS_AVAILABLE,
  SUCCESS,
  TRIP_ALREADY_BOOKED,
  TRIP_COMPLETED,
  TRIP_NOT_FOUND,
  TRIP_NOT_SCHEDULED,
  UNAUTHORIZED,
  UNAUTHORIZED_ACCESS,
  UNAUTHORIZED_CANCEL,
  USER_NOT_FOUND,
  USERS_NOT_FOUND,
} from "../constants/messages.js";

export const successResponse = (
  res: Response,
  data: any,
  messageOrStatusCode: string | number = SUCCESS,
  statusCode: number = 200
) => {
  const message =
    typeof messageOrStatusCode === "number" ? SUCCESS : messageOrStatusCode;
  const responseStatusCode =
    typeof messageOrStatusCode === "number" ? messageOrStatusCode : statusCode;

  return res.status(responseStatusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponseStandard = (
  error: any,
  res: Response,
  statusCode: number = 400
) => {
  if (error instanceof ZodError && error.issues.length > 0) {
    return res.status(400).json({
      error: error.issues[0]?.message,
      field: error.issues[0]?.path,
    });
  }

  if (error instanceof PrismaClientKnownRequestError) {
    const messages: Record<string, string> = {
      P2002: ALREADY_EXISTS,
      P2025: RECORD_NOT_FOUND,
      P2003: INVALID_REFERENCE,
      P2022: INVALID_FIELD,
    };
    const statusCodes: Record<string, number> = {
      P2002: 409,
      P2025: 404,
      P2003: 400,
      P2022: 400,
    };
    return res.status(statusCodes[error.code] ?? statusCode).json({
      error: messages[error.code] || DATABASE_ERROR,
      code: error.code,
    });
  }

  if (error instanceof PrismaClientValidationError) {
    return res.status(400).json({
      error: INVALID_DATABASE_DATA,
    });
  }

  const message = (error as Error).message;
  const mappedStatusCodes: Record<string, number> = {
    [ALREADY_EXISTS]: 409,
    [ALREADY_IN_WAITLIST]: 409,
    [BOOKING_ALREADY_CANCELLED]: 409,
    [CAR_ALREADY_EXISTS]: 409,
    [COD_PAYMENT_MODE]: 409,
    [COD_REFUND_NOT_ALLOWED]: 409,
    [EMAIL_ALREADY_EXISTS]: 409,
    [PAYMENT_ALREADY_MADE]: 409,
    [SEATS_AVAILABLE]: 409,
    [TRIP_ALREADY_BOOKED]: 409,
    [BOOKING_NOT_FOUND]: 404,
    [BOOKINGS_NOT_FOUND]: 404,
    [DRIVER_CAR_NOT_FOUND]: 404,
    [PAYMENT_ID_NOT_FOUND]: 404,
    [RECORD_NOT_FOUND]: 404,
    [TRIP_NOT_FOUND]: 404,
    [USER_NOT_FOUND]: 404,
    [USERS_NOT_FOUND]: 404,
    [INVALID_LOGIN_CREDENTIALS]: 401,
    [INVALID_REFRESH_TOKEN]: 401,
    [UNAUTHORIZED]: 401,
    [BOOKING_ACCESS_DENIED]: 403,
    [CHAT_ACCESS_DENIED]: 403,
    [DOCUMENTS_NOT_APPROVED]: 403,
    [UNAUTHORIZED_ACCESS]: 403,
    [UNAUTHORIZED_CANCEL]: 403,
    [FORBIDDEN]: 403,
    [INVALID_SIGNATURE]: 400,
    [INVALID_OTP]: 400,
    [INVALID_WEBHOOK_SIGNATURE]: 400,
    [NOT_ENOUGH_SEATS]: 422,
    [PAYMENT_NOT_MADE]: 422,
    [TRIP_COMPLETED]: 409,
    [TRIP_NOT_SCHEDULED]: 409,
  };

  const responseStatus = mappedStatusCodes[message] ?? statusCode;
  const responseMessage =
    responseStatus >= 500 ? INTERNAL_SERVER_ERROR : message;

  return res.status(responseStatus).json({ error: responseMessage });
};
