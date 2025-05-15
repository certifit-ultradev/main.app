import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import {  calculateQuizScore } from '@/services/courses';
import { CalculateQuizScore} from '@/utils/schemas';
import { NextRequest } from 'next/server';

/**
 * @param req 
 * @param context 
 * @returns 
 */
export async function POST(req: NextRequest) {
    try {
        const request = await req.json();
        const { canonicalId, quizId, moduleId } = request;
        CalculateQuizScore.parse({
            canonicalId, quizId, moduleId, 
        });

        const result = await calculateQuizScore({canonicalId, quizId, moduleId});
        return Response.json(result);
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}