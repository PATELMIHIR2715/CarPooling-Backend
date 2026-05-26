import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/client";
import type { Response } from "express";
import { ZodError } from "zod";
import {
  ALREADY_EXISTS,
  INVALID_FIELD,
  INVALID_REFERENCE,
  RECORD_NOT_FOUND,
} from "../constants/messages.js";

export const errorResponse = (
  error: any,
  res: Response,
  statusCode: number = 400
) => {
  if (error instanceof ZodError && error.issues.length > 0) {
    return res.status(statusCode).json({
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
    return res.status(statusCode).json({
      error: messages[error.code] || "Database error",
      code: error.code,
    });
  }

  if (error instanceof PrismaClientValidationError) {
    return res.status(400).json({
      error: "Invalid data provided to database",
    });
  }

  res.status(statusCode).json({ error: (error as Error).message });
};
