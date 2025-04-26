/*
  Warnings:

  - Added the required column `quiz_id` to the `UserQuizState` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserQuizState` ADD COLUMN `quiz_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `UserQuizState` ADD CONSTRAINT `UserQuizState_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `ModuleQuiz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQuizState` ADD CONSTRAINT `UserQuizState_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserQuizState` ADD CONSTRAINT `UserQuizState_course_module_id_fkey` FOREIGN KEY (`course_module_id`) REFERENCES `CourseModules`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
