import type { Request, Response } from "express";
import paymentService from "./payment.service.js";
import { RAZORPAY_SIGNATURE_HEADER } from "../../constants/labels.js";
import { WEBHOOK_ERROR } from "../../constants/messages.js";
import {
  errorResponseStandard,
  successResponse,
} from "../../utils/response.utils.js";

class PaymentController {
  // ---------------------------------------------------
  // Create Razorpay Order
  // ---------------------------------------------------
  async createOrder(req: any, res: Response) {
    try {
      const { bookingId } = req.body;
      const userId = req.user.userId;
      const order = await paymentService.createOrder(bookingId, userId);

      successResponse(res, order, 201);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  // ---------------------------------------------------
  // Verify Payment
  // ---------------------------------------------------
  async verifyPayment(req: any, res: Response) {
    try {
      const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        bookingId,
      } = req.body;
      const result = await paymentService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        bookingId
      );

      successResponse(res, result, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  // ---------------------------------------------------
  // Process Refund
  // ---------------------------------------------------
  async processRefund(req: any, res: Response) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;
      const result = await paymentService.processRefund(bookingId, userId);

      successResponse(res, result, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  // ---------------------------------------------------
  // Get Payment Details
  // ---------------------------------------------------
  async getPaymentDetails(req: any, res: Response) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;
      const payment = await paymentService.getPaymentDetails(bookingId, userId);

      successResponse(res, payment, 200);
    } catch (error) {
      errorResponseStandard(error, res);
    }
  }

  // ---------------------------------------------------
  // Webhook Handler
  // ---------------------------------------------------
  async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers[RAZORPAY_SIGNATURE_HEADER] as string;
      const result = await paymentService.handleWebhook(req.body, signature);
      successResponse(res, result, 200); // always return 200 to Razorpay
    } catch (error) {
      // Still return 200 to prevent Razorpay retries
      // but log the error
      console.error(WEBHOOK_ERROR, error);
      successResponse(res, { received: true }, 200);
    }
  }
}

export default new PaymentController();
