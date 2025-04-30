import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { sendEmailCourseRequestInfo } from '@/services/email';
import { NextRequest } from 'next/server';

// @ts-expect-error: params
export async function POST(req: NextRequest, context) {
    try {
        // Obtener el canonicalId desde los parámetros de la URL
        const { canonicalId } = context.params;

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