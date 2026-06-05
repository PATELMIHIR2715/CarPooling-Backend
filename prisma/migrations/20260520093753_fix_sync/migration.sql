/*
  Warnings:

  - A unique constraint covering the columns `[rideId,passengerId]` on the table `tbl_waiting_list` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tbl_waiting_list_rideId_passengerId_key" ON "tbl_waiting_list"("rideId", "passengerId");
