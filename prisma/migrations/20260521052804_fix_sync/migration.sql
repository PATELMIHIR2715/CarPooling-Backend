/*
  Warnings:

  - The `dropoffLocation` column on the `tbl_waiting_list` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `pickupLocation` column on the `tbl_waiting_list` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "tbl_waiting_list" DROP COLUMN "dropoffLocation",
ADD COLUMN     "dropoffLocation" JSONB,
DROP COLUMN "pickupLocation",
ADD COLUMN     "pickupLocation" JSONB;
