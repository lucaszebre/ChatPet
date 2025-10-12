/*
  Warnings:

  - Added the required column `expirationTime` to the `image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mineType` to the `image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeBytes` to the `image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."image" ADD COLUMN     "expirationTime" TEXT NOT NULL,
ADD COLUMN     "mineType" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "sizeBytes" TEXT NOT NULL;
