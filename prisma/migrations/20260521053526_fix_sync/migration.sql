/*
  Warnings:

  - Made the column `dropoffLocation` on table `tbl_waiting_list` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pickupLocation` on table `tbl_waiting_list` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tbl_waiting_list" ALTER COLUMN "dropoffLocation" SET NOT NULL,
ALTER COLUMN "dropoffLocation" SET DEFAULT '',
ALTER COLUMN "dropoffLocation" SET DATA TYPE TEXT,
ALTER COLUMN "pickupLocation" SET NOT NULL,
ALTER COLUMN "pickupLocation" SET DEFAULT '',
ALTER COLUMN "pickupLocation" SET DATA TYPE TEXT;
