import crypto from "crypto";
import {
  BookingStatus,
  PaymentMode,
  PaymentStatus,
  RefundStatus,
} from "@prisma/client";

import prisma from "../../config/database.js";
import env from "../../config/env.js";
import razorpay from "../../config/razorpay.js";
import {
  BOOKING_CANCELLED_REASON,
  BOOKINGS_NOT_FOUND,
  COD_PAYMENT_MODE,
  COD_REFUND_NOT_ALLOWED,
  DISPUTE_ACTION_REQUIRED,
  DISPUTE_CREATED,
  DISPUTE_WON,
  INVALID_SIGNATURE,
  INVALID_WEBHOOK_SIGNATURE,
  PAYMENT_ALREADY_MADE,
  PAYMENT_DOWNTIME_RESOLVED,
  PAYMENT_DOWNTIME_STARTED,
  PAYMENT_ID_NOT_FOUND,
  PAYMENT_NOT_MADE,
  PAYMENT_VERIFIED_SUCCESSFULLY,
  REFUND_INITIATED,
  REFUND_TIMELINE,
  UNAUTHORIZED_ACCESS,
  UNHANDLED_WEBHOOK_EVENT,
} from "../../constants/messages.js";
import {
  PAYMENT_CAPTURED_EVENT,
  PAYMENT_DISPUTE_ACTION_REQUIRED_EVENT,
  PAYMENT_DISPUTE_CREATED_EVENT,
  PAYMENT_DISPUTE_LOST_EVENT,
  PAYMENT_DISPUTE_WON_EVENT,
  PAYMENT_DOWNTIME_RESOLVED_EVENT,
  PAYMENT_DOWNTIME_STARTED_EVENT,
  PAYMENT_FAILED_EVENT,
  RAZORPAY_CURRENCY_INR,
  RAZORPAY_REFUND_SPEED_NORMAL,
} from "../../constants/labels.js";
import { emailProducer } from "../../utils/emailProducer.utils.js";

class PaymentService {
  async createOrder(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error(BOOKINGS_NOT_FOUND);
    }
    if (booking.passengerId !== userId) {
      throw new Error(UNAUTHORIZED_ACCESS);
    }
    if (booking.paymentStatus === PaymentStatus.PAID) {
      throw new Error(PAYMENT_ALREADY_MADE);
    }
    if (booking.paymentMode === PaymentMode.COD) {
      throw new Error(COD_PAYMENT_MODE);
    }

    const order = await razorpay.orders.create({
      amount: booking.price * 100,
      currency: RAZORPAY_CURRENCY_INR,
      receipt: `bk_${booking.id}`,
      notes: {
        bookingId,
        passengerId: userId,
      },
    });

    await prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        razorpayOrderId: order.id,
        amount: booking.price,
        currency: RAZORPAY_CURRENCY_INR,
        mode: PaymentMode.ADVANCE,
        status: PaymentStatus.PENDING,
      },
      update: {
        razorpayOrderId: order.id,
        amount: booking.price,
        currency: RAZORPAY_CURRENCY_INR,
        mode: PaymentMode.ADVANCE,
        status: PaymentStatus.PENDING,
        razorpayPaymentId: null,
        razorpaySignature: null,
        refundId: null,
        refundStatus: null,
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { orderId: order.id },
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
    bookingId: string,
    userId: string
  ) {
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      throw new Error(INVALID_SIGNATURE);
    }

    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: { booking: true },
    });

    if (!payment || payment.razorpayOrderId !== razorpayOrderId) {
      throw new Error(BOOKINGS_NOT_FOUND);
    }
    if (payment.booking.passengerId !== userId) {
      throw new Error(UNAUTHORIZED_ACCESS);
    }

    await prisma.payment.update({
      where: { bookingId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: PaymentStatus.PAID,
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });

    return { message: PAYMENT_VERIFIED_SUCCESSFULLY };
  }

  async processRefund(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, ride: true },
    });

    if (!booking) {
      throw new Error(BOOKINGS_NOT_FOUND);
    }
    if (booking.passengerId !== userId) {
      throw new Error(UNAUTHORIZED_ACCESS);
    }
    if (booking.paymentMode === PaymentMode.COD) {
      throw new Error(COD_REFUND_NOT_ALLOWED);
    }
    if (booking.paymentStatus !== PaymentStatus.PAID) {
      throw new Error(PAYMENT_NOT_MADE);
    }
    if (!booking.payment?.razorpayPaymentId) {
      throw new Error(PAYMENT_ID_NOT_FOUND);
    }

    const refundAmount = calculateRefundAmount(booking);
    const refund = await razorpay.payments.refund(
      booking.payment.razorpayPaymentId,
      {
        amount: refundAmount * 100,
        speed: RAZORPAY_REFUND_SPEED_NORMAL,
        notes: {
          bookingId,
          reason: BOOKING_CANCELLED_REASON,
        },
      }
    );

    await prisma.payment.update({
      where: { bookingId },
      data: {
        refundId: refund.id,
        refundStatus: RefundStatus.PENDING,
        status: PaymentStatus.REFUNDED,
      },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        paymentStatus: PaymentStatus.REFUNDED,
      },
    });

    return {
      message: REFUND_INITIATED,
      refundAmount,
      refundId: refund.id,
      timeline: REFUND_TIMELINE,
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
      throw new Error(UNAUTHORIZED_ACCESS);
    }

    return booking.payment;
  }

  async handleWebhook(body: Buffer, signature: string) {
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error(INVALID_WEBHOOK_SIGNATURE);
    }

    const parsedBody = JSON.parse(body.toString("utf8"));
    const event = parsedBody.event;
    const payload = parsedBody.payload;

    switch (event) {
      case PAYMENT_CAPTURED_EVENT: {
        const payment = await prisma.payment.update({
          where: { razorpayOrderId: payload.payment.entity.order_id },
          data: {
            razorpayPaymentId: payload.payment.entity.id,
            status: PaymentStatus.PAID,
          },
          include: {
            booking: {
              include: { passenger: true, ride: { include: { driver: true } } },
            },
          },
        });

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: PaymentStatus.PAID },
        });

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

      case PAYMENT_FAILED_EVENT: {
        await prisma.payment.update({
          where: { razorpayOrderId: payload.payment.entity.order_id },
          data: { status: PaymentStatus.FAILED },
        });
        break;
      }

      case PAYMENT_DISPUTE_CREATED_EVENT: {
        const payment = await prisma.payment.findFirst({
          where: { razorpayPaymentId: payload.dispute.entity.payment_id },
        });
        console.error(`${DISPUTE_CREATED}: ${payment?.id}`);
        break;
      }

      case PAYMENT_DISPUTE_WON_EVENT: {
        console.log(`${DISPUTE_WON}: ${payload.dispute.entity.id}`);
        break;
      }

      case PAYMENT_DISPUTE_LOST_EVENT: {
        const payment = await prisma.payment.update({
          where: { razorpayPaymentId: payload.dispute.entity.payment_id },
          data: {
            status: PaymentStatus.REFUNDED,
            refundStatus: RefundStatus.PROCESSED,
          },
        });

        await prisma.booking.update({
          where: { id: payment.bookingId },
          data: { paymentStatus: PaymentStatus.REFUNDED },
        });
        break;
      }

      case PAYMENT_DISPUTE_ACTION_REQUIRED_EVENT: {
        console.error(`${DISPUTE_ACTION_REQUIRED}: ${payload.dispute.entity.id}`);
        break;
      }

      case PAYMENT_DOWNTIME_STARTED_EVENT: {
        console.warn(
          `${PAYMENT_DOWNTIME_STARTED}: ${payload.payment.entity?.method}`
        );
        break;
      }

      case PAYMENT_DOWNTIME_RESOLVED_EVENT: {
        console.log(PAYMENT_DOWNTIME_RESOLVED);
        break;
      }

      default:
        console.log(`${UNHANDLED_WEBHOOK_EVENT}: ${event}`);
    }

    return { received: true };
  }
}

const calculateRefundAmount = (booking: {
  price: number;
  ride: { departureTime: Date | string };
}): number => {
  const now = new Date();
  const departureTime = new Date(booking.ride.departureTime);
  const hoursUntilDeparture =
    (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeparture >= 24) {
    return booking.price;
  }
  if (hoursUntilDeparture >= 12) {
    return booking.price * 0.75;
  }
  if (hoursUntilDeparture >= 6) {
    return booking.price * 0.5;
  }

  return 0;
};

export default new PaymentService();
