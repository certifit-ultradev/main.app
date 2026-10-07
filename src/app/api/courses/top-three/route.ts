import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getCatalogCourses } from '@/services/courses';
import { apiSuccess } from '@/interfaces/http/api-response';

/**
 * 
 * @returns 
 */
export async function GET() {
    try {
        return Response.json(apiSuccess(await getCatalogCourses()));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
