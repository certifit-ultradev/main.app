import type { EmailDataFormValues } from './contact-form.schema';
import { ApiFailureSchema, apiSuccessSchema } from '@/interfaces/http/api-response.schema';
import { CourseInformationSentResponseSchema } from '@/interfaces/http/courses/course-email.contract';

type Fetcher = typeof fetch;

export class CourseInformationRequestError extends Error {}

export async function sendCourseInformationRequest(
    canonicalId: string,
    values: EmailDataFormValues,
    fetcher: Fetcher = fetch,
): Promise<void> {
    let response: Response;
    try {
        response = await fetcher(`/api/courses/${canonicalId}/email`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values),
        });
    } catch {
        throw new CourseInformationRequestError('No fue posible conectar para enviar la solicitud.');
    }
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        const failure = ApiFailureSchema.safeParse(payload);
        throw new CourseInformationRequestError(failure.success ? failure.data.error.message : 'No fue posible enviar la solicitud.');
    }
    if (!apiSuccessSchema(CourseInformationSentResponseSchema).safeParse(payload).success) {
        throw new CourseInformationRequestError('La respuesta no tiene el formato esperado.');
    }
}
