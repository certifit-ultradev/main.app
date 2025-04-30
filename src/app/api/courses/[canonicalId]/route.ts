import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getUserCourseWithModulesByCanonicalId } from '@/services/courses';
import { CourseModule, QuestionOption, QuizQuestions } from '@/utils/types';
import { NextRequest } from 'next/server';

// @ts-expect-error: context
export async function GET(req: NextRequest, context) {
    try {
        const params = await context.params;
        const { canonicalId } = params;
        const course = await getUserCourseWithModulesByCanonicalId(canonicalId);
        if (!course) {
            throw new Error("El curso no existe");
        }

        const modules = course.courseModules?.map((courseModule): CourseModule => ({
            id: courseModule.id,
            courseId: courseModule.courseId,
            title: courseModule.title,
            minRequiredPoints: courseModule.minRequiredPoints,
            classes: courseModule.moduleClass?.map((cls) => ({
                id: cls.id,
                courseModuleId: cls.courseModuleId,
                title: cls.title,
                description: cls.description,
                video: cls.videoPath,
                videoDuration: cls.videoDuration,
                videoSize: cls.videoSize
            })),
            quiz: {
                id: courseModule.moduleQuiz?.[0].id,
                courseModuleId: courseModule.moduleQuiz?.[0].courseModuleId,
                title: courseModule.moduleQuiz?.[0].title as string,
                description: courseModule.moduleQuiz?.[0].description as string,
                questions: courseModule.moduleQuiz?.[0].quizQuestion?.map((question): QuizQuestions => ({
                    id: question.id,
                    quizModuleId: question.quizId,
                    type: question.type,
                    title: question.title,
                    points: question.points,
                    options: question.possibleAnswerQuestion?.map((option): QuestionOption => ({
                        id: option.id,
                        quizQuestionId: option.questionId,
                        value: option.value,
                        isCorrect: option.isCorrect
                    }))
                })),
            }
        }));

        if (!course.userCourse) {
            throw Error("El curso no le pertenece al usuario");
        }

        return Response.json({
            canonicalId: course.canonicalId,
            title: course.title,
            description: course.description,
            courseImage: course.courseImage,
            instructorName: course.instructorName,
            instructorPhoto: course.instructorPhoto,
            expiresAt: new Date(course.expiresAt).toISOString().split('T')[0],
            category: course.category,
            price: course.price,
            modules: modules,
            moduleCompleted: course.userCourse[0].userModuleState?.map((moduleState) => {
                return {
                    moduleId: moduleState.moduleId,
                    isCompleted: moduleState.completed,
                    createdAt: moduleState.createdAt
                }
            }),
            classCompleted: course.userCourse[0].userClassesState?.map((classState) => {
                return {
                    classId: classState.classId,
                    currentVideoTime: classState.currentVideoTime,
                    isCompleted: classState.completed,
                    createdAt: classState.createdAt
                }
            }),
            quizCompleted: course.userCourse[0].userQuizState?.map((quizState) => {
                return {
                    quizId: quizState.quizId,
                    courseModuleId: quizState.courseModuleId,
                    result: quizState.result,
                    retries: quizState.retries,
                    passed: quizState.passed,
                    createdAt: quizState.createdAt
                }
            })
        });
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}