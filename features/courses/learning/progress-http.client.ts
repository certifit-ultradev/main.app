import { ApiFailureSchema, apiSuccessSchema } from '@/interfaces/http/api-response.schema';
import {
    CompleteModuleRequestSchema,
    ProgressSavedResponseSchema,
    RecordClassProgressRequestSchema,
    type CompleteModuleRequest,
    type RecordClassProgressRequest,
} from '@/interfaces/http/courses/progress.contract';

type Fetcher = typeof fetch;

export class CourseProgressHttpError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
        this.name = 'CourseProgressHttpError';
    }
}

async function postProgress(path: string, command: unknown, fetcher: Fetcher): Promise<void> {
    let response: Response;
    try {
        response = await fetcher(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(command),
        });
    } catch {
        throw new CourseProgressHttpError('No se pudo conectar para guardar el progreso.', 0);
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        const failure = ApiFailureSchema.safeParse(payload);
        throw new CourseProgressHttpError(
            failure.success ? failure.data.error.message : 'No fue posible guardar el progreso.',
            response.status,
        );
    }

    if (!apiSuccessSchema(ProgressSavedResponseSchema).safeParse(payload).success) {
        throw new CourseProgressHttpError('La respuesta de progreso no tiene el formato esperado.', 502);
    }
}

export const saveClassProgress = async (
    command: RecordClassProgressRequest,
    fetcher: Fetcher = fetch,
): Promise<void> => postProgress(
    '/api/courses/class-state',
    RecordClassProgressRequestSchema.parse(command),
    fetcher,
);

export const saveModuleCompletion = async (
    command: CompleteModuleRequest,
    fetcher: Fetcher = fetch,
): Promise<void> => postProgress(
    '/api/courses/module-state',
    CompleteModuleRequestSchema.parse(command),
    fetcher,
);
