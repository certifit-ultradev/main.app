-- Preserve the current visible order of existing modules and classes.
ALTER TABLE "Course" ADD COLUMN "draft_key" TEXT;
CREATE UNIQUE INDEX "Course_draft_key_key" ON "Course"("draft_key");

ALTER TABLE "CourseModules" ADD COLUMN "position" INTEGER;
ALTER TABLE "ModuleClass" ADD COLUMN "position" INTEGER;

WITH ordered AS (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "course_id" ORDER BY "id") - 1 AS ordinal
    FROM "CourseModules"
)
UPDATE "CourseModules" AS target SET "position" = ordered.ordinal
FROM ordered WHERE target."id" = ordered."id";

WITH ordered AS (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "course_module_id" ORDER BY "id") - 1 AS ordinal
    FROM "ModuleClass"
)
UPDATE "ModuleClass" AS target SET "position" = ordered.ordinal
FROM ordered WHERE target."id" = ordered."id";

ALTER TABLE "CourseModules" ALTER COLUMN "position" SET NOT NULL;
ALTER TABLE "ModuleClass" ALTER COLUMN "position" SET NOT NULL;
CREATE INDEX "CourseModules_course_id_position_idx" ON "CourseModules"("course_id", "position");
CREATE INDEX "ModuleClass_course_module_id_position_idx" ON "ModuleClass"("course_module_id", "position");

CREATE TABLE "CourseAssetCleanup" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "course_id" INTEGER NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "available_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_attempt_at" TIMESTAMP(3),
    CONSTRAINT "CourseAssetCleanup_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CourseAssetCleanup_url_key" ON "CourseAssetCleanup"("url");
CREATE INDEX "CourseAssetCleanup_course_id_idx" ON "CourseAssetCleanup"("course_id");
