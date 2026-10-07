import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getUserCourses } from '@/services/courses';
import { apiSuccess } from '@/interfaces/http/api-response';

/**
 * @returns 
 */
export async function GET() {
    try {
        const userCourses = await getUserCourses();
        return Response.json(apiSuccess(userCourses));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
