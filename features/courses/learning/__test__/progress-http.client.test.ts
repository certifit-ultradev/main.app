import {
    CourseProgressHttpError,
    saveClassProgress,
    saveModuleCompletion,
} from '@/features/courses/learning/progress-http.client';

const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const classCommand = { canonicalId: 'course-1', classId: 2, currentTime: 12, isCompleted: false };

describe('course progress HTTP client', () => {
    it('sends validated class progress and accepts a persisted acknowledgement', async () => {
        const fetcher = jest.fn().mockResolvedValue(response({ data: { saved: true } }));

        await expect(saveClassProgress(classCommand, fetcher)).resolves.toBeUndefined();
        expect(fetcher).toHaveBeenCalledWith('/api/courses/class-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: expect.any(String),
        });
        expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(classCommand);
    });

    it('sends module completion and validates the acknowledgement', async () => {
        const fetcher = jest.fn().mockResolvedValue(response({ data: { saved: true } }));

        await expect(saveModuleCompletion({ canonicalId: 'course-1', moduleId: 3 }, fetcher)).resolves.toBeUndefined();
        expect(fetcher).toHaveBeenCalledWith('/api/courses/module-state', expect.objectContaining({
            body: JSON.stringify({ canonicalId: 'course-1', moduleId: 3 }),
        }));
    });

    it.each([
        { data: { saved: false } },
        { saved: true },
        { data: { saved: true }, error: { code: 'UNEXPECTED', message: 'Contradictorio' } },
        null,
    ])('rejects malformed success envelopes before advancing the UI', async (body) => {
        const fetcher = jest.fn().mockResolvedValue(response(body));

        await expect(saveModuleCompletion({ canonicalId: 'course-1', moduleId: 3 }, fetcher))
            .rejects.toEqual(new CourseProgressHttpError('La respuesta de progreso no tiene el formato esperado.', 502));
    });

    it('preserves a validated public HTTP error', async () => {
        const fetcher = jest.fn().mockResolvedValue(response({
            error: { code: 'FORBIDDEN', message: 'No tienes acceso a este curso.' },
        }, 403));

        await expect(saveClassProgress(classCommand, fetcher))
            .rejects.toEqual(new CourseProgressHttpError('No tienes acceso a este curso.', 403));
    });

    it('hides malformed error payloads and handles network rejection', async () => {
        const malformed = jest.fn().mockResolvedValue(response({ error: 'Secreto interno' }, 500));
        const offline = jest.fn().mockRejectedValue(new Error('Secreto de red'));

        await expect(saveClassProgress(classCommand, malformed))
            .rejects.toEqual(new CourseProgressHttpError('No fue posible guardar el progreso.', 500));
        await expect(saveClassProgress(classCommand, offline))
            .rejects.toEqual(new CourseProgressHttpError('No se pudo conectar para guardar el progreso.', 0));
    });

    it('rejects non-JSON success responses', async () => {
        const fetcher = jest.fn().mockResolvedValue(new Response('{', { status: 200 }));

        await expect(saveClassProgress(classCommand, fetcher))
            .rejects.toEqual(new CourseProgressHttpError('La respuesta de progreso no tiene el formato esperado.', 502));
    });

    it('rejects invalid commands before calling fetch', async () => {
        const fetcher = jest.fn();

        await expect(saveClassProgress({ ...classCommand, currentTime: -1 }, fetcher)).rejects.toThrow();
        expect(fetcher).not.toHaveBeenCalled();
    });
});
