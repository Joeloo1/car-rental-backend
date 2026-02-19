/*
  Warnings:

  - Added the required column `publicId` to the `CarImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CarImage" ADD COLUMN     "isMain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publicId" TEXT NOT NULL;
