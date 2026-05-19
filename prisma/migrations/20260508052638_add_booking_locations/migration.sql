/*
  Warnings:

  - You are about to drop the column `rideId` on the `tbl_booking` table. All the data in the column will be lost.
  - Added the required column `tripId` to the `tbl_booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "tbl_booking" DROP CONSTRAINT "tbl_booking_rideId_fkey";

-- AlterTable
ALTER TABLE "tbl_booking" DROP COLUMN "rideId",
ADD COLUMN     "tripId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "tbl_booking" ADD CONSTRAINT "tbl_booking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "tbl_ride"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
