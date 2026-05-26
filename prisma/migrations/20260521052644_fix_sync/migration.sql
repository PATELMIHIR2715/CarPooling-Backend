-- AlterTable
ALTER TABLE "tbl_waiting_list" ADD COLUMN     "dropoffLocation" TEXT,
ADD COLUMN     "pickupLocation" TEXT,
ADD COLUMN     "seatsRequested" INTEGER NOT NULL DEFAULT 1;
