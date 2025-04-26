"use server";

import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { editCourse, registerCourse, updateClassVideoPath } from "@/services/courses";
import { CourseData, CourseModule, EditClassVideo, EditCourseData, QuestionOption, QuizQuestions, ServerActionRequest, ServerActionResponse } from "@/utils/types";
import { Middlewares } from "../server-action-middleware";
import { isAdmin } from "../middlewares/is-admin";

export const register = async (request: ServerActionRequest<CourseData>): Promise<ServerActionResponse<CourseData | null>> => {
    return await Middlewares<CourseData | null, CourseData>(
        request,
        [isAdmin],
        async (courseData: CourseData) => {
            try {
                const course = await registerCourse(courseData);
                if (!course) {
                    return { success: false, error: "No se pudo crear el curso." }
                }

                const modules = course.courseModules?.map((courseModule): CourseModule => ({
                    id: courseModule.id,
                    courseId: courseModule.courseId,
                    name: courseModule.title,
                    minRequiredPoints: courseModule.minRequiredPoints,
                    classes: courseModule.moduleClass?.map((cls) => ({
                        id: cls.id,
                        courseModuleId: cls.courseModuleId,
                        name: cls.title,
                        description: cls.description,
                        video: cls.videoPath,
                    })),
                    quiz: {
                        id: courseModule.moduleQuiz?.[0].id,
                        courseModuleId: courseModule.moduleQuiz?.[0].courseModuleId,
                        title: courseModule.moduleQuiz?.[0].title ?? '',
                        description: courseModule.moduleQuiz?.[0].description ?? '',
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

                return {
                    success: true, payload: {
                        id: course.id,
                        title: course.title,
                        description: course.description,
                        courseImage: course.courseImage,
                        instructorName: course.instructorName,
                        instructorPhoto: course.instructorPhoto,
                        expiresAt: new Date(course.expiresAt).toISOString().split('T')[0],
                        category: course.category,
                        price: course.price,
                        modules: modules
                    }, message: "Curso creado correctamente."
                }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        });
}

export const edit = async (request: ServerActionRequest<EditCourseData>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, EditCourseData>(
        request,
        [isAdmin],
        async (courseData: EditCourseData) => {
            try {
                console.dir(courseData, { depth: null })
                await editCourse(courseData.originalCourseData, courseData.newCourseData);

                return { success: true, message: "Curso editado correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        });
}

export const editClassVideoPath = async (request: ServerActionRequest<EditClassVideo>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, EditClassVideo>(
        request,
        [isAdmin],
        async (classVideoData: EditClassVideo) => {
            try {
                const resultEditedClass = await updateClassVideoPath(classVideoData.clsId, classVideoData.videoPath, classVideoData.videoSize);
                if (!resultEditedClass) {
                    return { success: false, error: "No se pudo modificar la clase." }
                }

                return { success: true, message: "Información del video de la clase modificada correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        });

}