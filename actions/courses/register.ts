"use server";

import { mapErrorToServerActionResponse } from "@/exceptions/error-encoder";
import { editCourse, registerCourse, updateClassVideoPath } from "@/services/courses";
import { CourseData, EditClassVideo, EditCourseData, ServerActionRequest, ServerActionResponse } from "@/utils/types";
import { Middlewares } from "../server-action-middleware";
import { requireAdminVerifiedUser } from "../middlewares/middlewares";
import { ModuleMapper } from "@/mappers/course-mapper";

/**
 * 
 * @param request 
 * @returns 
 */
export const register = async (request: ServerActionRequest<CourseData>): Promise<ServerActionResponse<CourseData | null>> => {
    return await Middlewares<CourseData | null, CourseData>(
        request,
        [requireAdminVerifiedUser],
        async (courseData: CourseData) => {
            try {
                const course = await registerCourse(courseData);
                if (!course) {
                    return { success: false, error: "No se pudo crear el curso." }
                }

                const modules = ModuleMapper.toDTOArray(course.courseModules);

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
                return mapErrorToServerActionResponse(error, true);
            }
        });
}

/**
 * 
 * @param request 
 * @returns 
 */
export const edit = async (request: ServerActionRequest<EditCourseData>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, EditCourseData>(
        request,
        [requireAdminVerifiedUser],
        async (courseData: EditCourseData) => {
            try {
                await editCourse(courseData.originalCourseData, courseData.newCourseData);

                return { success: true, message: "Curso editado correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error, true);
            }
        });
}

/**
 * 
 * @param request 
 * @returns 
 */
export const editClassVideoPath = async (request: ServerActionRequest<EditClassVideo>): Promise<ServerActionResponse<null>> => {
    return await Middlewares<null, EditClassVideo>(
        request,
        [requireAdminVerifiedUser],
        async (classVideoData: EditClassVideo) => {
            try {
                const resultEditedClass = await updateClassVideoPath(classVideoData.clsId, classVideoData.videoPath, classVideoData.videoSize);
                if (!resultEditedClass) {
                    return { success: false, error: "No se pudo modificar la clase." }
                }

                return { success: true, message: "Información del video de la clase modificada correctamente." }
            } catch (error) {
                return mapErrorToServerActionResponse(error, true);
            }
        });

}