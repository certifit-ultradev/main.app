import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getUserCourseQuizAnswers} from '@/services/courses';
import { NextRequest } from 'next/server';

/**
 * @param req 
 * @param context 
 * @returns 
 */
// @ts-expect-error: context
export async function GET(req: NextRequest, context) {
    try {
        const params = await context.params;
        const { canonicalId, quizId } = params;
        const answers = await getUserCourseQuizAnswers(canonicalId, Number(quizId));
        return Response.json(answers.map((answer) => {
            return {
                userCourseId: answer.userCourseId,
                quizId: answer.quizId,
                questionId: answer.questionId,
                answer: answer.answer,
            }
        }));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}