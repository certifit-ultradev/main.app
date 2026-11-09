import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { registerClassCurrentState } from '@/services/courses';
import { RecordClassProgressRequestSchema } from '@/interfaces/http/courses/progress.contract';
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
        const command = RecordClassProgressRequestSchema.parse(await parseJsonBody(req));
        const result = await registerClassCurrentState(
            command.canonicalId,
            command.classId,
            command.currentTime,
            command.isCompleted,
        );
        if (result.success !== true) throw new Error('No se confirmó el guardado del progreso de clase');
        return Response.json(apiSuccess({ saved: true as const }));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
