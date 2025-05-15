import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getUserCourses } from '@/services/courses';

/**
 * @returns 
 */
export async function GET() {
    try {
        const userCourses = await getUserCourses();
        return Response.json(userCourses);
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}