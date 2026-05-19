import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import env from "./config/env.js";
import prisma from "./config/database.js";
import authRoutes from "./modules/auth/auth.routes.js";
import carRoutes from "./modules/driver/car/car.routes.js";
import tripRoutes from "./modules/driver/trip/trip.routes.js";
import bookingRoutes from "./modules/driver/bookings/booking.routes.js";
import locationRoutes from "./modules/location/location.routes.js";
import passengerTripRoutes from "./modules/passenger/trip/trip.routes.js";
import {
  API,
  AUTH,
  BOOKING,
  CAR,
  TRIP,
  LOCATION,
  PASSENGER,
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
    .then(() => console.log("Database connected successfully!"))
    .catch((err) => console.error("Database connection failed:", err));
});
