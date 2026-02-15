-- CreateEnum
CREATE TYPE "PermissionStatus" AS ENUM ('ONREVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('REPLACE', 'REMOVE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DocumentStatus" ADD VALUE 'approved_replace';
ALTER TYPE "DocumentStatus" ADD VALUE 'approved_remove';
ALTER TYPE "DocumentStatus" ADD VALUE 'rejected_replace';
ALTER TYPE "DocumentStatus" ADD VALUE 'rejected_remove';

-- CreateTable
CREATE TABLE "permission_requests" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "request_type" "RequestType" NOT NULL,
    "status_permission" "PermissionStatus" NOT NULL DEFAULT 'ONREVIEW',
    "message" TEXT,
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "permission_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "permission_requests" ADD CONSTRAINT "permission_requests_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_requests" ADD CONSTRAINT "permission_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission_requests" ADD CONSTRAINT "permission_requests_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
