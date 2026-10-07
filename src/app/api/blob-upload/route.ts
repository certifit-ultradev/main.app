import { BlobUploadRequestSchema, BlobUploadResponseSchema } from '@/interfaces/http/blob-upload.contract';
import { BlobUploadPolicyError, handleCourseBlobUpload } from '@/infrastructure/blob/vercel-client-upload';
import { getAuthenticatedActor } from '@/infrastructure/auth/authenticated-actor';
import { InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { NextResponse } from 'next/server';

// @swagger
// /api/blob-upload:
//   post:
//     summary: Genera un token temporal para subida directa de assets de cursos
//     description: Recibe el sobre JSON del SDK de Vercel Blob; no recibe el archivo binario.
//     tags:
//       - Blob Upload
//     requestBody:
//       required: true
//       content:
//         application/json:
//           schema:
//             oneOf:
//               - $ref: '#/components/schemas/BlobGenerateClientTokenEvent'
//               - $ref: '#/components/schemas/BlobUploadCompletedEvent'
//     responses:
//       200:
//         description: Token de cliente o acuse de subida completada según el evento.
//         content:
//           application/json:
//             schema:
//               oneOf:
//                 - type: object
//                   required: [type, clientToken]
//                   properties:
//                     type:
//                       type: string
//                       enum: [blob.generate-client-token]
//                     clientToken:
//                       type: string
//                 - type: object
//                   required: [type, response]
//                   properties:
//                     type:
//                       type: string
//                       enum: [blob.upload-completed]
//                     response:
//                       type: string
//                       enum: [ok]
//       401:
//         description: El actor no tiene una sesión válida.
//       403:
//         description: El actor no es administrador.
//       422:
//         description: Evento o ruta de asset inválido/no permitido.
//       502:
//         description: El proveedor devolvió una respuesta de protocolo inválida.
export async function POST(request: Request): Promise<NextResponse> {
    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: 'El cuerpo de la solicitud no contiene JSON válido.' }, { status: 400 });
    }

    const parsed = BlobUploadRequestSchema.safeParse(payload);
    if (!parsed.success) {
        return NextResponse.json({ error: 'El evento de subida no es válido.' }, { status: 422 });
    }

    try {
        const response = await handleCourseBlobUpload({
            request,
            body: parsed.data,
            authorizeAdmin: async () => {
                try {
                    // Blob permits pending uploads before email verification, but still requires an admin session.
                    return await getAuthenticatedActor({ requireAdmin: true, requireEmailVerified: false });
                } catch (error) {
                    if (error instanceof UserNotLoggedError) {
                        throw new BlobUploadPolicyError(401, 'Debes iniciar sesión.');
                    }
                    if (error instanceof InsufficientRoleError) {
                        throw new BlobUploadPolicyError(403, 'No tienes permisos de administrador.');
                    }
                    throw error;
                }
            },
        });
        const parsedResponse = BlobUploadResponseSchema.safeParse(response);
        if (!parsedResponse.success) {
            return NextResponse.json({ error: 'No se pudo procesar la subida.' }, { status: 502 });
        }
        return NextResponse.json(parsedResponse.data);
    } catch (error) {
        if (error instanceof BlobUploadPolicyError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        return NextResponse.json({ error: 'No se pudo procesar la subida.' }, { status: 400 });
    }
}
