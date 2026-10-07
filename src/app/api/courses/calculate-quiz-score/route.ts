import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { NotFoundError } from '@/exceptions/not-found';
import { calculateQuizScore } from '@/services/courses';
import { CalculateQuizScoreRequestSchema } from '@/interfaces/http/courses/quiz.contract';
import { parseJsonBody } from '@/interfaces/http/parse-json-body';
import { NextRequest } from 'next/server';
import { apiSuccess } from '@/interfaces/http/api-response';

/**
 * @param req 
 * @param context 
 * @returns 
 */
export async function POST(req: NextRequest) {
    try {
        const command = CalculateQuizScoreRequestSchema.parse(await parseJsonBody(req));
        const result = await calculateQuizScore(command);
        if (!result) throw new NotFoundError('No fue posible calcular el resultado del quiz');
        return Response.json(apiSuccess({
            questionCount: result.questionCount,
            totalScore: result.totalScore,
            pass: result.pass,
        }));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
