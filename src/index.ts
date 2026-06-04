import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import { startTripCron } from "./cron/trip.cron.js";
import { startBookingCron } from "./cron/booking.cron.js";
import { startWaitlistCron } from "./cron/waitlist.cron.js";
import env from "./config/env.js";
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
} from "./constants/routes.js";
// test connection

const app = express();
const port = env.PORT || 8000;

// app.use(cors());
app.use(
  cors({
    origin: "*", // or specifically "http://localhost:5173"
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
  })
);
app.options("{*path}", cors());
app.use(cookieParser());
app.use(express.json());
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
app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server running",
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  prisma
    .$connect()
    .then(() => {
      console.log("Database connected successfully!");
      startTripCron();
      startBookingCron();
      startWaitlistCron();
    })
    .catch((err) => console.error("Database connection failed:", err));
});
