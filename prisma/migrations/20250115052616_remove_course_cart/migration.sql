/*
  Warnings:

  - You are about to drop the `CartCourse` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `course_id` to the `Cart` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CartCourse` DROP FOREIGN KEY `CartCourse_cart_id_fkey`;

-- DropForeignKey
ALTER TABLE `CartCourse` DROP FOREIGN KEY `CartCourse_course_id_fkey`;

-- AlterTable
ALTER TABLE `Cart` ADD COLUMN `course_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Purchase` ADD COLUMN `payment_method_type` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `reference` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `trx_creation_map` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `trx_id` VARCHAR(191) NOT NULL DEFAULT '';

-- DropTable
DROP TABLE `CartCourse`;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
