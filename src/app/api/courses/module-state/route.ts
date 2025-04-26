import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { registerModuleFinishtState } from '@/services/courses';
import { CreateModuleFinishState, } from '@/utils/schemas';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const request = await req.json();
        const { canonicalId, moduleId } = request;
        CreateModuleFinishState.parse({
            canonicalId, moduleId
        });

        const moduleState = await registerModuleFinishtState(canonicalId, moduleId);
        return Response.json(moduleState);
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}