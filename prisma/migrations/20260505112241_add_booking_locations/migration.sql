/*
  Warnings:

  - Added the required column `dropoffLocation` to the `tbl_booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupLocation` to the `tbl_booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_booking" ADD COLUMN     "dropoffLocation" TEXT NOT NULL,
ADD COLUMN     "pickupLocation" TEXT NOT NULL;
