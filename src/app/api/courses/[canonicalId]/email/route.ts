import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { sendEmailCourseRequestInfo } from '@/services/email';
import {
    CourseEmailParamsSchema,
    CourseInformationRequestSchema,
    type CourseInformationSentResponse,
    type CourseEmailRouteContext,
} from '@/interfaces/http/courses/course-email.contract';
import { parseJsonBody } from '@/interfaces/http/parse-json-body';
import { NextRequest } from 'next/server';
import { apiSuccess } from '@/interfaces/http/api-response';


/**
 * API Route para enviar un correo electrónico con la información de la solicitud de un curso.
 * 
 * @param req - La solicitud HTTP entrante.
 * @param context - El contexto de la ruta, que incluye los parámetros de la URL.
 * @returns - Respuesta JSON con el resultado del envío del correo electrónico.
 */
export async function POST(req: NextRequest, context: CourseEmailRouteContext) {
    try {
        const { canonicalId } = CourseEmailParamsSchema.parse(await context.params);
        const requestData = CourseInformationRequestSchema.parse(await parseJsonBody(req));
        await sendEmailCourseRequestInfo({ canonicalId, ...requestData });

        const body = { message: 'Correo electrónico enviado correctamente.' } satisfies CourseInformationSentResponse;
        return Response.json(apiSuccess(body));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}
