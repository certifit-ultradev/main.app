-- CreateTable
CREATE TABLE `UserQuizState` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `course_id` INTEGER NOT NULL,
    `course_module_id` INTEGER NOT NULL,
    `retries` INTEGER NOT NULL,
    `result` INTEGER NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
