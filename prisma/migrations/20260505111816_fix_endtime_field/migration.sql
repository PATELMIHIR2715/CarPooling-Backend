/*
  Warnings:

  - You are about to drop the column `endtime` on the `tbl_ride` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `tbl_ride` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_ride" DROP COLUMN "endtime",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL;
