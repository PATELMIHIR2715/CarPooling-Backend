/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `tbl_user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tbl_user" ADD COLUMN     "refreshToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tbl_user_refreshToken_key" ON "tbl_user"("refreshToken");
