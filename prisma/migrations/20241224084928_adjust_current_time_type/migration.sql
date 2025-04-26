/*
  Warnings:

  - You are about to alter the column `current_video_time` on the `UserClassesState` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `UserClassesState` MODIFY `current_video_time` DOUBLE NOT NULL;
