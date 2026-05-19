/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `tbl_document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tbl_document_userId_key" ON "tbl_document"("userId");
