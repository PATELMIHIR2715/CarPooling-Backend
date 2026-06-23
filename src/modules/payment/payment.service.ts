import crypto from "crypto";
import prisma from "../../config/database.js";
import env from "../../config/env.js";
import razorpay from "../../config/razorpay.js";
import {
  BOOKINGS_NOT_FOUND,
  UNAUTHORIZED_ACCESS,
} from "../../constants/messages.js";
import { emailProducer } from "../../utils/emailProducer.utils.js";

class PaymentService {
  async createOrder(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { ride: true },
    });

    if (!booking) {
      throw new Error(BOOKINGS_NOT_FOUND);
    }
    if (booking.passengerId !== userId) {
      throw new Error(UNAUTHORIZED_ACCESS);
    }
    if (booking.paymentStatus === "PAID") {
      throw new Error("Payment already made");
    }
    if (booking.paymentMode === "COD") {
      throw new Error("Payment mode is cash on delivery");
    }

    const order = await razorpay.orders.create({
      amount: booking.price * 100,
      currency: "INR",
      receipt: `bk_${booking.id}`,
      notes: {
        bookingId,
        passengerId: userId,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId,
        razorpayOrderId: order.id,
        amount: booking.price,
        currency: "INR",
        mode: "ADVANCE",
        status: "PENDING",
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.RAZORPAY_KEY_ID,
      bookingId,
    };
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
    bookingId: string
  ) {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw new Error("Invalid signature");
    }

    await prisma.payment.update({
      where: { id: bookingId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: "PAID",
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "PAID",
      },
    });

    return { message: "Payment verifid successfully" };
  }

  async processRefund(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, ride: true },
    });

    if (!booking) throw new Error(BOOKINGS_NOT_FOUND);
    if (booking.passengerId !== userId) throw new Error(UNAUTHORIZED_ACCESS);
    if (booking.paymentMode === "COD")
      throw new Error("COD booking cannot be refunded online");
    if (booking.paymentStatus !== "PAID") throw new Error("Payment not made");
    if (!booking.payment?.razorpayPaymentId)
      throw new Error("Payment ID not found");

    const refundAmount = calculateRefundAmount(booking);

    const refund = await razorpay.payments.refund(
      booking.payment.razorpayPaymentId,
      {
        amount: refundAmount * 100,
        speed: "normal",
        notes: {
          bookingId,
          reason: "Booking Cancelled",
        },
      }
    );

    // Update payment record
    await prisma.payment.update({
      where: { bookingId },
      data: {
        refundId: refund.id,
        refundStatus: "PENDING",
        status: "REFUNDED",
      },
    });

    // Update booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        paymentStatus: "REFUNDED",
      },
    });

    return {
      message: "Refund initiated",
      refundAmount,
      refundId: refund.id,
      timeline: "5-7 business days",
    };
  }

  async getPaymentDetails(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      throw new Error(BOOKINGS_NOT_FOUND);
    }
    if (booking.passengerId !== userId) {
      //   throw new Error(UNAUTHORIZED_ACCESS);
    }

    return booking.payment;
  }

  async handleWebhook(body: any, signature: string) {
    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error("Invalid webhook signature");
    }

    const event = body.event;
    const payload = body.payload;

    switch (event) {
      // ✅ Payment successful
      case "payment.captured": {
        const payment = await prisma.payment.update({
          where: { razorpayOrderId: payload.payment.entity.order_id },
          data: {
            razorpayPaymentId: payload.payment.entity.id,
            status: "PAID",
          },
          include: {
            booking: {
              include: { passenger: true, ride: { include: { driver: true } } },
            },
          },
        });
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: "PAID" },
        });
        // Send confirmation email
        await emailProducer.sendBookingPaymentEmail(
          payment.booking.passenger.email,
          payment.booking.passenger.name,
          payment.booking.ride.driver.name,
          payment.booking.ride.origin,
          payment.booking.dropoffLocation,
          String(payment.booking.ride.departureTime)
        );
        break;
      }

      // ❌ Payment failed
      case "payment.failed": {
        await prisma.payment.update({
          where: { razorpayOrderId: payload.payment.entity.order_id },
          data: { status: "FAILED" },
        });
        // TODO: send payment failed email
        break;
      }

      // ⚠️ Dispute raised
      case "payment.dispute.created": {
        // Notify admin
        const payment = await prisma.payment.findFirst({
          where: { razorpayPaymentId: payload.dispute.entity.payment_id },
        });
        console.error(`DISPUTE CREATED for payment: ${payment?.id}`);
        // TODO: send admin alert email
        break;
      }

      // ✅ Dispute won
      case "payment.dispute.won": {
        console.log(`Dispute won: ${payload.dispute.entity.id}`);
        break;
      }

      // ❌ Dispute lost
      case "payment.dispute.lost": {
        const payment = await prisma.payment.update({
          where: { razorpayPaymentId: payload.dispute.entity.payment_id },
          data: {
            status: "REFUNDED",
            refundStatus: "PROCESSED",
          },
        });
        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: "REFUNDED" },
        });
        break;
      }

      // 🚨 Action required - urgent!
      case "payment.dispute.action_required": {
        console.error(
          `URGENT: Dispute action required: ${payload.dispute.entity.id}`
        );
        // TODO: send urgent admin email
        break;
      }

      // 🔧 Downtime started
      case "payment.downtime.started": {
        console.warn(
          `Payment downtime started: ${payload.payment.entity?.method}`
        );
        // TODO: update system status
        break;
      }

      // ✅ Downtime resolved
      case "payment.downtime.resolved": {
        console.log(`Payment downtime resolved`);
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return { received: true };
  }
}

// ---------------------------------------------------
// Refund Policy
// ---------------------------------------------------
const calculateRefundAmount = (booking: any): number => {
  const now = new Date();
  const departureTime = new Date(booking.ride.departureTime);
  const hoursUntilDeparture =
    (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeparture >= 24) {
    return booking.price; // 100% refund
  } else if (hoursUntilDeparture >= 12) {
    return booking.price * 0.75; // 75% refund
  } else if (hoursUntilDeparture >= 6) {
    return booking.price * 0.5; // 50% refund
  } else {
    return 0; // no refund
  }
};

export default new PaymentService();
