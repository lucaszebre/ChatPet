/*
  Warnings:

  - Added the required column `displayName` to the `image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileUri` to the `image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."image" ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "fileUri" TEXT NOT NULL;
