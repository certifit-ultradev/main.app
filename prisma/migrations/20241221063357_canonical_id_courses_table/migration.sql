/*
  Warnings:

  - A unique constraint covering the columns `[canonicalId]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `canonicalId` VARCHAR(255) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `Course_canonicalId_key` ON `Course`(`canonicalId`);
