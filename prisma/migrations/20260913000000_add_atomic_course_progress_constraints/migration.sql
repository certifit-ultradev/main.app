-- Keep the most recent value for each progress key before enforcing idempotency.
DELETE FROM "UserClassesState" AS older
USING "UserClassesState" AS newer
WHERE older.user_course_id = newer.user_course_id
  AND older.class_id = newer.class_id
  AND older.id < newer.id;

DELETE FROM "UserModuleState" AS older
USING "UserModuleState" AS newer
WHERE older.user_course_id = newer.user_course_id
  AND older.module_id = newer.module_id
  AND older.id < newer.id;

DELETE FROM "UserQuizAnswer" AS older
USING "UserQuizAnswer" AS newer
WHERE older.user_course_id = newer.user_course_id
  AND older.quiz_id = newer.quiz_id
  AND older.question_id = newer.question_id
  AND older.id < newer.id;

DELETE FROM "UserQuizState" AS older
USING "UserQuizState" AS newer
WHERE older.user_course_id = newer.user_course_id
  AND older.quiz_id = newer.quiz_id
  AND older.id < newer.id;

CREATE UNIQUE INDEX "UserClassesState_user_course_id_class_id_key"
ON "UserClassesState"("user_course_id", "class_id");

CREATE UNIQUE INDEX "UserModuleState_user_course_id_module_id_key"
ON "UserModuleState"("user_course_id", "module_id");

CREATE UNIQUE INDEX "UserQuizAnswer_user_course_id_quiz_id_question_id_key"
ON "UserQuizAnswer"("user_course_id", "quiz_id", "question_id");

CREATE UNIQUE INDEX "UserQuizState_user_course_id_quiz_id_key"
ON "UserQuizState"("user_course_id", "quiz_id");

DELETE FROM "ModuleQuiz" AS older
USING "ModuleQuiz" AS newer
WHERE older.course_module_id = newer.course_module_id
  AND older.id < newer.id;

CREATE UNIQUE INDEX "ModuleQuiz_course_module_id_key"
ON "ModuleQuiz"("course_module_id");
