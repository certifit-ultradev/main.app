import { CourseNotPurchasedError } from '@/exceptions/course-not-purchased';
import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { NotFoundError } from '@/exceptions/not-found';
import { getUserCourseWithModulesByCanonicalId } from '@/services/courses';
import { ModuleMapper } from '@/mappers/course-mapper';
import { NextRequest } from 'next/server';

/**
 * @param req 
 * @param context 
 * @returns 
 */
// @ts-expect-error: context
export async function GET(req: NextRequest, context) {
    try {
        const params = await context.params;
        const { canonicalId } = params;
        const course = await getUserCourseWithModulesByCanonicalId(canonicalId);
        if (!course) {
            throw new NotFoundError("El curso no existe");
        }

        const modules = ModuleMapper.toDTOArray(course.courseModules, { hideQuizAnswers: true });

        if (!course.userCourse) {
            throw new CourseNotPurchasedError("El curso no le pertenece al usuario");
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