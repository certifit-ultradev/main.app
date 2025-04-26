import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { registerQuestionAnswer } from '@/services/courses';
import { CreateAnswerQuestionSchema } from '@/utils/schemas';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const request = await req.json();
        const { canonicalId, questionId, answer, quizId, optionId, moduleId } = request;
        CreateAnswerQuestionSchema.parse({
            canonicalId, questionId, answer, quizId, moduleId, optionId
        });

        const result = await registerQuestionAnswer({canonicalId, questionId, answer, quizId, moduleId, optionId});
        return Response.json(result);
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}