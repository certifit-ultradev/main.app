-- DropForeignKey
ALTER TABLE "ModuleClass" DROP CONSTRAINT "ModuleClass_course_module_id_fkey";

-- DropForeignKey
ALTER TABLE "ModuleQuiz" DROP CONSTRAINT "ModuleQuiz_course_module_id_fkey";

-- DropForeignKey
ALTER TABLE "PossibleAnswerQuestion" DROP CONSTRAINT "PossibleAnswerQuestion_question_id_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestion" DROP CONSTRAINT "QuizQuestion_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "UserClassesState" DROP CONSTRAINT "UserClassesState_class_id_fkey";

-- DropForeignKey
ALTER TABLE "UserQuizAnswer" DROP CONSTRAINT "UserQuizAnswer_possibleAnswerQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "UserQuizAnswer" DROP CONSTRAINT "UserQuizAnswer_question_id_fkey";

-- DropForeignKey
ALTER TABLE "UserQuizAnswer" DROP CONSTRAINT "UserQuizAnswer_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "UserQuizState" DROP CONSTRAINT "UserQuizState_course_module_id_fkey";

-- DropForeignKey
ALTER TABLE "UserQuizState" DROP CONSTRAINT "UserQuizState_quiz_id_fkey";

-- AddForeignKey
ALTER TABLE "ModuleClass" ADD CONSTRAINT "ModuleClass_course_module_id_fkey" FOREIGN KEY ("course_module_id") REFERENCES "CourseModules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleQuiz" ADD CONSTRAINT "ModuleQuiz_course_module_id_fkey" FOREIGN KEY ("course_module_id") REFERENCES "CourseModules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "ModuleQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PossibleAnswerQuestion" ADD CONSTRAINT "PossibleAnswerQuestion_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizState" ADD CONSTRAINT "UserQuizState_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "ModuleQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizState" ADD CONSTRAINT "UserQuizState_course_module_id_fkey" FOREIGN KEY ("course_module_id") REFERENCES "CourseModules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClassesState" ADD CONSTRAINT "UserClassesState_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "ModuleClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizAnswer" ADD CONSTRAINT "UserQuizAnswer_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "ModuleQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizAnswer" ADD CONSTRAINT "UserQuizAnswer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "QuizQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizAnswer" ADD CONSTRAINT "UserQuizAnswer_possibleAnswerQuestionId_fkey" FOREIGN KEY ("possibleAnswerQuestionId") REFERENCES "PossibleAnswerQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
