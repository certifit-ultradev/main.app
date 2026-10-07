import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { NotFoundError } from '@/exceptions/not-found';
import { getStudentCourseByCanonicalId } from '@/services/courses';
import { CourseParamsSchema, type CourseRouteContext } from '@/interfaces/http/courses/params.contract';
import { NextRequest } from 'next/server';
import { apiSuccess } from '@/interfaces/http/api-response';

/**
 * @param req 
 * @param context 
 * @returns 
 */
export async function GET(_req: NextRequest, context: CourseRouteContext) {
    try {
        const { canonicalId } = CourseParamsSchema.parse(await context.params);
        const course = await getStudentCourseByCanonicalId(canonicalId);
        if (!course) {
            throw new NotFoundError("El curso no existe");
        }

        return Response.json(apiSuccess(course));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
