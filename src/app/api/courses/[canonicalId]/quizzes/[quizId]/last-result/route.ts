import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getUserQuizState } from '@/services/courses';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, context) {
    try {
        const params = await context.params;
        const { canonicalId, quizId } = params;
        const userQuizState = await getUserQuizState(canonicalId, Number(quizId));
        return Response.json({
            quizId: userQuizState.quizId,
            userCourseId: userQuizState.userCourseId,
            courseModuleId: userQuizState.courseModuleId,
            retries: userQuizState.retries,
            result: userQuizState.result,
            passed: userQuizState.passed,
        });
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}