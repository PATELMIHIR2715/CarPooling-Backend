-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DRIVER', 'PASSENGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WaitingListStatus" AS ENUM ('WAITING', 'NOTIFIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "tbl_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "role" "Role" NOT NULL DEFAULT 'PASSENGER',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_car" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "colour" TEXT NOT NULL,
    "seater" INTEGER NOT NULL,
    "rcNumber" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_booking" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "seatBooked" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_ride" (
    "id" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "tripcode" TEXT NOT NULL,
    "status" "RideStatus" NOT NULL DEFAULT 'SCHEDULED',
    "pickupLocations" TEXT[],
    "endtime" TIMESTAMP(3) NOT NULL,
    "carId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_ride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_waiting_list" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "WaitingListStatus" NOT NULL DEFAULT 'WAITING',

    CONSTRAINT "tbl_waiting_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "licenceurl" TEXT NOT NULL,
    "rcurl" TEXT NOT NULL,
    "rcStatus" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "licenceStatus" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_review" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tbl_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_chat" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rideId" TEXT NOT NULL,

    CONSTRAINT "tbl_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tbl_message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tbl_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_email_key" ON "tbl_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_phone_key" ON "tbl_user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_car_rcNumber_key" ON "tbl_car"("rcNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_car_licensePlate_key" ON "tbl_car"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_car_driverId_key" ON "tbl_car"("driverId");

-- CreateIndex
CREATE UNIQUE INDEX "tbl_ride_tripcode_key" ON "tbl_ride"("tripcode");

-- AddForeignKey
ALTER TABLE "tbl_car" ADD CONSTRAINT "tbl_car_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_booking" ADD CONSTRAINT "tbl_booking_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "tbl_ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_booking" ADD CONSTRAINT "tbl_booking_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_ride" ADD CONSTRAINT "tbl_ride_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_ride" ADD CONSTRAINT "tbl_ride_carId_fkey" FOREIGN KEY ("carId") REFERENCES "tbl_car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_waiting_list" ADD CONSTRAINT "tbl_waiting_list_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "tbl_ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_waiting_list" ADD CONSTRAINT "tbl_waiting_list_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_document" ADD CONSTRAINT "tbl_document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_review" ADD CONSTRAINT "tbl_review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_review" ADD CONSTRAINT "tbl_review_revieweeId_fkey" FOREIGN KEY ("revieweeId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_review" ADD CONSTRAINT "tbl_review_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "tbl_ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_chat" ADD CONSTRAINT "tbl_chat_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "tbl_ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_chat" ADD CONSTRAINT "tbl_chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_chat" ADD CONSTRAINT "tbl_chat_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_message" ADD CONSTRAINT "tbl_message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "tbl_chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tbl_message" ADD CONSTRAINT "tbl_message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "tbl_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
