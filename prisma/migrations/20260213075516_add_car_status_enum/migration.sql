/*
  Warnings:

  - The values [inactive] on the enum `CarStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CarStatus_new" AS ENUM ('available', 'rented', 'maintenance', 'unavailable');
ALTER TABLE "public"."Car" ALTER COLUMN "availabilityStatus" DROP DEFAULT;
ALTER TABLE "Car" ALTER COLUMN "availabilityStatus" TYPE "CarStatus_new" USING ("availabilityStatus"::text::"CarStatus_new");
ALTER TYPE "CarStatus" RENAME TO "CarStatus_old";
ALTER TYPE "CarStatus_new" RENAME TO "CarStatus";
DROP TYPE "public"."CarStatus_old";
ALTER TABLE "Car" ALTER COLUMN "availabilityStatus" SET DEFAULT 'available';
COMMIT;
