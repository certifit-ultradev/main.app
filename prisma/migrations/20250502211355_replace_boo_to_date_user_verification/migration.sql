/*
  Warnings:

  - Added the required column `email_verified` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_verified",
ADD COLUMN     "email_verified" TIMESTAMP(3) NOT NULL;
