"use server";

import { getAllCourses, getCourseById } from "@/services/courses";
import { CourseData, CourseList, DataPaginated, FetchCourseByID, FetchPage, ServerActionRequest, ServerActionResponse } from "@/utils/types";
import { requireAdminVerifiedUser } from "../middlewares/middlewares";
import { Middlewares } from "../server-action-middleware";
import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { ModuleMapper } from "@/mappers/course-mapper";

/**
 * 
 * @param request 
 * @returns 
 */
export const listAll = async (request: ServerActionRequest<FetchPage>): Promise<ServerActionResponse<DataPaginated<CourseList>>> => {
    return await Middlewares<DataPaginated<CourseList>, FetchPage>(
        request,
        [requireAdminVerifiedUser],
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
                return mapErrorToServerActionResponse(error, true);
            }
        }
    );
}

/**
 * 
 * @param request 
 * @returns 
 */
export const getCourseDataById = async (request: ServerActionRequest<FetchCourseByID>): Promise<ServerActionResponse<CourseData>> => {
    return await Middlewares<CourseData, FetchCourseByID>(
        request,
        [requireAdminVerifiedUser],
        async (request: FetchCourseByID) => {
            try {
                const course = await getCourseById(request.id);
                const modules = ModuleMapper.toDTOArray(course.courseModules);

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
