/*
  Warnings:

  - You are about to drop the column `course_id` on the `UserQuizState` table. All the data in the column will be lost.
  - Added the required column `user_course_id` to the `UserQuizState` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `UserQuizState` DROP FOREIGN KEY `UserQuizState_course_id_fkey`;

-- DropIndex
DROP INDEX `UserQuizState_course_id_fkey` ON `UserQuizState`;

-- AlterTable
ALTER TABLE `UserQuizState` DROP COLUMN `course_id`,
    ADD COLUMN `courseId` INTEGER NULL,
    ADD COLUMN `user_course_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `UserQuizState` ADD CONSTRAINT `UserQuizState_user_course_id_fkey` FOREIGN KEY (`user_course_id`) REFERENCES `UserCourse`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQuizState` ADD CONSTRAINT `UserQuizState_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
