/*
  Warnings:

  - You are about to drop the column `used` on the `otps` table. All the data in the column will be lost.
  - Added the required column `device` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OTPStatusType" AS ENUM ('PENDING', 'USED', 'EXPIRED');

-- AlterTable
ALTER TABLE "otps" DROP COLUMN "used",
ADD COLUMN     "status" "OTPStatusType" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "device" TEXT NOT NULL,
ADD COLUMN     "is_valid" BOOLEAN NOT NULL DEFAULT true;
