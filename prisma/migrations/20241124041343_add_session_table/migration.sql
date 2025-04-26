/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `instructor_id` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `QuizQuestion` table. All the data in the column will be lost.
  - You are about to drop the `Instructor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `instructor_name` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_instructor_id_fkey`;

-- AlterTable
ALTER TABLE `Course` DROP COLUMN `deleted_at`,
    DROP COLUMN `instructor_id`,
    ADD COLUMN `categoryId` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `instructor_name` VARCHAR(191) NOT NULL,
    MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `CourseModules` ADD COLUMN `deleted` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `ModuleClass` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `ModuleQuiz` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `PossibleAnswerQuestion` MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `QuizQuestion` DROP COLUMN `description`,
    MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `is_admin` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `updated_at` DATETIME(3) NULL;

-- DropTable
DROP TABLE `Instructor`;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `session_token` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_session_token_key`(`session_token`),
    INDEX `Session_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_email_token_key`(`email`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourseCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `CourseCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
