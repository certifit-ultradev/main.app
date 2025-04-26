import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { registerClassCurrentState } from '@/services/courses';
import { CreateClassCurrentStateSchema } from '@/utils/schemas';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const request = await req.json();
        const { canonicalId, classId, isCompleted, currentTime } = request;
        CreateClassCurrentStateSchema.parse({
            canonicalId, classId, isCompleted, currentTime
        });

        const activeCourses = await registerClassCurrentState(canonicalId, classId, currentTime, isCompleted);
        return Response.json(activeCourses);
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}