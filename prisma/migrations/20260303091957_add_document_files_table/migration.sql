/*
  Warnings:

  - You are about to drop the column `url_doc` on the `documents` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "documents" DROP COLUMN "url_doc";

-- CreateTable
CREATE TABLE "document_files" (
    "id" SERIAL NOT NULL,
    "url_doc" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "document_id" INTEGER NOT NULL,

    CONSTRAINT "document_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "document_files" ADD CONSTRAINT "document_files_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
