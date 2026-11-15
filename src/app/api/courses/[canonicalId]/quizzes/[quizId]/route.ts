import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getUserCourseQuizAnswers} from '@/services/courses';
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
        const answers = await getUserCourseQuizAnswers(canonicalId, quizId);
        return Response.json(apiSuccess(answers.map((answer) => ({ questionId: answer.questionId, answer: answer.answer }))));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
