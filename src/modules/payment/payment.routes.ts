import { Router } from "express";
import paymentController from "./payment.controller.js";
import { authenticate, authorize } from "../auth/auth.middleware.js";
import { PASSENGER_ROLE } from "../../constants/labels.js";
import {
  BOOKINGID,
  CREATE_ORDER,
  REFUND,
  VERIFY,
} from "../../constants/routes.js";

const router = Router();

// Create order
router.post(
  CREATE_ORDER,
  authenticate,
  authorize([PASSENGER_ROLE]),
  paymentController.createOrder
);

// Verify payment
router.post(
  VERIFY,
  authenticate,
  authorize([PASSENGER_ROLE]),
  paymentController.verifyPayment
);

// Get payment details
router.get(BOOKINGID, authenticate, paymentController.getPaymentDetails);

// Process refund
router.post(
  `${BOOKINGID}${REFUND}`,
  authenticate,
  authorize([PASSENGER_ROLE]),
  paymentController.processRefund
);

export default router;
