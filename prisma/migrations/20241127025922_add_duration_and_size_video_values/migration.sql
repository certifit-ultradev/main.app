-- AlterTable
ALTER TABLE `ModuleClass` ADD COLUMN `video_duration` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `video_size` INTEGER NOT NULL DEFAULT 0;
