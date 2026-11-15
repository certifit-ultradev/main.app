import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getCatalogCourses } from '@/services/courses';
import { apiSuccess } from '@/interfaces/http/api-response';
import { safeLogger } from '@/shared/observability/safe-logger';

/**
 * 
 * @returns 
 */
export async function GET() {
    try {
        return Response.json(apiSuccess(await getCatalogCourses()));
    } catch (error) {
        safeLogger.error('http.courses.top_three.failed');
        return mapErrorToAPIResponse(error);
    }
}
