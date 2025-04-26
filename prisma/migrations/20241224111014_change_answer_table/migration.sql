/*
  Warnings:

  - You are about to drop the column `answer_id` on the `UserQuizAnswer` table. All the data in the column will be lost.
  - Added the required column `answer` to the `UserQuizAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correct` to the `UserQuizAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `UserQuizAnswer` DROP FOREIGN KEY `UserQuizAnswer_answer_id_fkey`;

-- AlterTable
ALTER TABLE `UserQuizAnswer` DROP COLUMN `answer_id`,
    ADD COLUMN `answer` VARCHAR(191) NOT NULL,
    ADD COLUMN `correct` VARCHAR(191) NOT NULL,
    ADD COLUMN `possibleAnswerQuestionId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `UserQuizAnswer` ADD CONSTRAINT `UserQuizAnswer_possibleAnswerQuestionId_fkey` FOREIGN KEY (`possibleAnswerQuestionId`) REFERENCES `PossibleAnswerQuestion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
