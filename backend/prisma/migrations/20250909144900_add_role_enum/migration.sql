/*
  Warnings:

  - Added the required column `role` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."role" AS ENUM ('USER', 'MODEL');

-- AlterTable
ALTER TABLE "public"."message" ADD COLUMN     "role" "public"."role" NOT NULL;
