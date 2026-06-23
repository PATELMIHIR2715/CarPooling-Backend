-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('COD', 'ADVANCE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

-- AlterTable
ALTER TABLE "tbl_booking" ADD COLUMN     "orderId" TEXT,
ADD COLUMN     "paymentMode" "PaymentMode" NOT NULL DEFAULT 'COD',
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "tbl_payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "mode" "PaymentMode" NOT NULL,
    "refundId" TEXT,
    "refundStatus" "RefundStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_payment_bookingId_key" ON "tbl_payment"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_payment_razorpayOrderId_key" ON "tbl_payment"("razorpayOrderId");

-- AddForeignKey
ALTER TABLE "tbl_payment" ADD CONSTRAINT "tbl_payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "tbl_booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
