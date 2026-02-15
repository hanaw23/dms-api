/*
  Warnings:

  - Made the column `created_at` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('uploaded', 'pending_replace', 'pending_remove');

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" SET DATA TYPE TEXT,
ALTER COLUMN "password" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "role" DROP DEFAULT;

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "name_doc" TEXT NOT NULL,
    "url_doc" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'uploaded',
    "is_remove_permission" BOOLEAN NOT NULL DEFAULT false,
    "is_replace_permission" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "username_UNIQUE" RENAME TO "users_username_key";
