import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { sendEmailCourseRequestInfo } from '@/services/email';
import { NextRequest } from 'next/server';


/**
 * API Route para enviar un correo electrónico con la información de la solicitud de un curso.
 * 
 * @param req - La solicitud HTTP entrante.
 * @param context - El contexto de la ruta, que incluye los parámetros de la URL.
 * @returns - Respuesta JSON con el resultado del envío del correo electrónico.
 */
// @ts-expect-error: params
export async function POST(req: NextRequest, context) {
    try {
        // Obtener el canonicalId desde los parámetros de la URL
        const { canonicalId } = await context.params;

        // Leer los datos del form (JSON) enviado en la request
        const requestData = await req.json();

        // Mapear los datos y enviarlos a la función sendEmailCourseRequestInfo
        const result = await sendEmailCourseRequestInfo({
            canonicalId,
            nombre: requestData.nombre,
            empresa: requestData.empresa,
            email: requestData.email,
            telefono: requestData.telefono,
            curso: requestData.curso,
            detalles: requestData.detalles,
            terminos: requestData.terminos,
        });

        return Response.json(result);
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}