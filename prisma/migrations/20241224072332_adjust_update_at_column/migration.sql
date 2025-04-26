/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `PossibleAnswerQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `UserCourse` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Cart` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `CartCourse` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `CourseCategory` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `PossibleAnswerQuestion` DROP COLUMN `isCorrect`,
    ADD COLUMN `is_correct` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Purchase` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `Session` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `UserClassesState` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `UserCourse` DROP COLUMN `completedAt`,
    ADD COLUMN `completed_at` DATETIME(3) NULL,
    MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `UserModuleState` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `UserQuizAnswer` MODIFY `updated_at` DATETIME(3) NULL;
