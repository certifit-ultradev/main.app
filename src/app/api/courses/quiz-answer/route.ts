import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { registerQuestionAnswer } from '@/services/courses';
import { SubmitQuizAnswerRequestSchema } from '@/interfaces/http/courses/quiz.contract';
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
        const command = SubmitQuizAnswerRequestSchema.parse(await parseJsonBody(req));
        const result = await registerQuestionAnswer(command);
        if (result.success !== true) throw new Error('No se confirmó el guardado de la respuesta');
        return Response.json(apiSuccess({ saved: true as const }));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
