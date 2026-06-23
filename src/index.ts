import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import helmet from "helmet";
import compression from "compression";
import ratelimit from "express-rate-limit";

import { startTripCron } from "./cron/trip.cron.js";
import { startBookingCron } from "./cron/booking.cron.js";
import { startWaitlistCron } from "./cron/waitlist.cron.js";
import env from "./config/env.js";
import { corsOptions } from "./config/cors.js";
import prisma from "./config/database.js";
import authRoutes from "./modules/auth/auth.routes.js";
import carRoutes from "./modules/driver/car/car.routes.js";
import tripRoutes from "./modules/driver/trip/trip.routes.js";
import bookingRoutes from "./modules/driver/bookings/booking.routes.js";
import locationRoutes from "./modules/location/location.routes.js";
import passengerTripRoutes from "./modules/passenger/trip/trip.routes.js";
import passengerBookingRoutes from "./modules/passenger/booking/booking.routes.js";
import ratingRoutes from "./modules/rating/rate.routes.js";
import userRoutes from "./modules/admin/users/user.routes.js";
import dashboardRoutes from "./modules/admin/dashboard/dashboard.routes.js";
import documentRoutes from "./modules/admin/documents/documents.routes.js";
import tripRotes from "./modules/admin/trips/trips.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import paymentController from "./modules/payment/payment.controller.js";
import {
  API,
  AUTH,
  BOOKING,
  CAR,
  TRIP,
  LOCATION,
  PASSENGER,
  RATING,
  ADMIN,
  CHAT,
  PAYMENT,
  WEBHOOK,
} from "./constants/routes.js";
import {
  CORS_PREFLIGHT_PATH,
  HEALTH_ROUTE,
  JSON_LIMIT_1MB,
} from "./constants/labels.js";
import { initSocket } from "./socket/socket.js";
import { startEmailWorker } from "./workers/email.worker.js";
import { successResponse } from "./utils/response.utils.js";
import {
  DATABASE_CONNECTED,
  DATABASE_CONNECTION_FAILED,
  SERVER_RUNNING,
  TOO_MANY_REQUESTS,
} from "./constants/messages.js";
import paymentRoutes from "./modules/payment/payment.routes.js";

// test connection

const app = express();
const port = env.PORT || 8000;
const httpServer = createServer(app);
const io = initSocket(httpServer);

const genralRateLimiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: TOO_MANY_REQUESTS },
});

const authLimiter = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: TOO_MANY_REQUESTS },
});

app.use(cors(corsOptions));
app.use(genralRateLimiter);
app.use(`${API}${AUTH}`, authLimiter);
app.use(helmet()); // security headers
app.use(compression());
app.options(CORS_PREFLIGHT_PATH, cors(corsOptions));
app.use(cookieParser());
app.post(
  `${API}${PAYMENT}${WEBHOOK}`,
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);
app.use(express.json({ limit: JSON_LIMIT_1MB }));
app.use(`${API}${AUTH}`, authRoutes);
app.use(`${API}${CAR}`, carRoutes);
app.use(`${API}${TRIP}`, tripRoutes);
app.use(`${API}${BOOKING}`, bookingRoutes);
app.use(`${API}${LOCATION}`, locationRoutes);
app.use(`${API}${PASSENGER}`, passengerTripRoutes);
app.use(`${API}${PASSENGER}`, passengerBookingRoutes);
app.use(`${API}${RATING}`, ratingRoutes);
app.use(`${API}${ADMIN}`, userRoutes);
app.use(`${API}${ADMIN}`, dashboardRoutes);
app.use(`${API}${ADMIN}`, documentRoutes);
app.use(`${API}${ADMIN}`, tripRotes);
app.use(`${API}${CHAT}`, chatRoutes);
app.use(`${API}${PAYMENT}`, paymentRoutes);

app.get(HEALTH_ROUTE, (_, res) => {
  successResponse(res, null, SERVER_RUNNING, 200);
});

httpServer.listen(port, () => {
  console.log(`io-socket-server running on port ${port}`);

  prisma
    .$connect()
    .then(() => {
      console.log(DATABASE_CONNECTED);
      startTripCron();
      startBookingCron();
      startWaitlistCron();
      startEmailWorker();
    })
    .catch((err: unknown) => console.error(DATABASE_CONNECTION_FAILED, err));
});
