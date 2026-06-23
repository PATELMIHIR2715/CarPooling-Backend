/*
  Warnings:

  - A unique constraint covering the columns `[razorpayPaymentId]` on the table `tbl_payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'ACTION_REQUIRED', 'WON', 'LOST', 'CLOSED');

-- CreateTable
CREATE TABLE "tbl_dispute" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "razorpayDisputeId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_dispute_razorpayDisputeId_key" ON "tbl_dispute"("razorpayDisputeId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_payment_razorpayPaymentId_key" ON "tbl_payment"("razorpayPaymentId");

-- AddForeignKey
ALTER TABLE "tbl_dispute" ADD CONSTRAINT "tbl_dispute_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "tbl_payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
