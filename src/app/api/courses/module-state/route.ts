import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { registerModuleFinishtState } from '@/services/courses';
import { CompleteModuleRequestSchema } from '@/interfaces/http/courses/progress.contract';
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
        const command = CompleteModuleRequestSchema.parse(await parseJsonBody(req));
        const result = await registerModuleFinishtState(command.canonicalId, command.moduleId);
        if (result.success !== true) throw new Error('No se confirmó el guardado del módulo');
        return Response.json(apiSuccess({ saved: true as const }));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
