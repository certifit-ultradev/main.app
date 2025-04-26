"use server";

import { getAllCourses, getCourseById } from "@/services/courses";
import { CourseData, CourseList, CourseModule, DataPaginated, FetchCourseByID, FetchPage, QuestionOption, QuizQuestions, ServerActionRequest, ServerActionResponse } from "@/utils/types";
import { isAdmin } from "../middlewares/is-admin";
import { Middlewares } from "../server-action-middleware";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";

export const listAll = async (request: ServerActionRequest<FetchPage>): Promise<ServerActionResponse<DataPaginated<CourseList>>> => {
    return await Middlewares<DataPaginated<CourseList>, FetchPage>(
        request,
        [isAdmin],
        async (request: FetchPage) => {
            try {
                const coursesPaged = await getAllCourses({ page: request.page });
                if (!coursesPaged) {
                    return {
                        success: false,
                        payload: {
                            data: [],
                            page: 1,
                            lastPage: 1,
                            total: 0
                        }
                    };
                }

                return {
                    success: true,
                    payload: {
                        ...coursesPaged,
                        data: coursesPaged.data.map<CourseList>((course) => ({
                            id: course.id,
                            title: course.title,
                            isActive: course.isActive
                        }))
                    }
                };
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        }
    );
}

export const getCourseDataById = async (request: ServerActionRequest<FetchCourseByID>): Promise<ServerActionResponse<CourseData>> => {
    return await Middlewares<CourseData, FetchCourseByID>(
        request,
        [isAdmin],
        async (request: FetchCourseByID) => {
            try {
                const course = await getCourseById(request.id);
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
                    success: true,
                    payload: {
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
                    }
                }
            } catch (error) {
                return mapErrorToServerActionResponse(error);
            }
        }
    );
}
