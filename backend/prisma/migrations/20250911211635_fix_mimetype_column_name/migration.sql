/*
  Warnings:

  - You are about to drop the column `mineType` on the `image` table. All the data in the column will be lost.
  - Added the required column `mimeType` to the `image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."image" DROP COLUMN "mineType",
ADD COLUMN     "mimeType" TEXT NOT NULL;
