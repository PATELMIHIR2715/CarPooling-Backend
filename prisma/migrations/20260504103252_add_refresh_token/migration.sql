/*
  Warnings:

  - You are about to drop the column `colour` on the `tbl_car` table. All the data in the column will be lost.
  - Added the required column `color` to the `tbl_car` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tbl_car" DROP COLUMN "colour",
ADD COLUMN     "color" TEXT NOT NULL;
