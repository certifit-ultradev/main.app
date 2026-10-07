import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { NotFoundError } from '@/exceptions/not-found';
import { getUserQuizState } from '@/services/courses';
import { CourseQuizParamsSchema, type CourseQuizRouteContext } from '@/interfaces/http/courses/params.contract';
import { NextRequest } from 'next/server';
import { apiSuccess } from '@/interfaces/http/api-response';

/**
 * @param req 
 * @param context 
 * @returns 
 */
export async function GET(_req: NextRequest, context: CourseQuizRouteContext) {
    try {
        const { canonicalId, quizId } = CourseQuizParamsSchema.parse(await context.params);
        const userQuizState = await getUserQuizState(canonicalId, quizId);
        if (!userQuizState) throw new NotFoundError('No hay un intento registrado para este quiz');
        return Response.json(apiSuccess({
            quizId: userQuizState.quizId,
            courseModuleId: userQuizState.courseModuleId,
            retries: userQuizState.retries,
            result: userQuizState.result,
            passed: userQuizState.passed,
        }));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
