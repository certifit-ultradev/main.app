import { auth } from '@/auth';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// create comment in swagger
// @swagger
// /api/blob-upload:
//   post:
//     summary: Upload a file
//     description: Upload a file to the server
//     tags:
//       - Blob Upload
//     requestBody:
//       required: true
//       content:
//         application/json:
//           schema:
//             type: object
//             properties:
//               file:
//                 type: string
//                 format: binary
//     responses:
//       200:
//         description: File uploaded successfully
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 success:
//                   type: boolean
//                   description: Indicates if the upload was successful
//                 url:
//                   type: string
//                   description: The URL of the uploaded file
//       400:
//         description: Bad request
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 error:
//                   type: string
//                   description: Error message
//       500:
//         description: Internal server error
//         content:
//           application/json:
//             schema:
//               type: object
//               properties:
//                 error:
//                   type: string
//                   description: Error message
//     security:
//       - bearerAuth: []
//     components:
//       securitySchemes:
//         bearerAuth:
//           type: http
//           scheme: bearer
//           bearerFormat: JWT
//       schemas:
//         FileUploadResponse:
//           type: object
//           properties:
//             success:
//               type: boolean
//               description: Indicates if the upload was successful
//             url:
//               type: string
//               description: The URL of the uploaded file
//         ErrorResponse:
//           type: object
//           properties:
//             error:
//               type: string
//               description: Error message
export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (
                pathname,
                /* clientPayload */
            ) => {
                const session = await auth();
                console.log('pathname', pathname);
                if (!session?.user.isAdmin) {
                    return {
                        success: false,
                        error: "No tienes permisos de administrador.",
                    };
                }

                return {
                    allowedContentTypes: ['video/mp4', 'image/jpeg', 'image/png'],
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({
                        userId: session.user.id,
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Get notified of client upload completion
                // ⚠️ This will not work on `localhost` websites,
                // Use ngrok or similar to get the full upload flow

                console.log('blob upload completed', blob, tokenPayload);

                try {
                    // Run any logic after the file upload completed
                    // const { userId } = JSON.parse(tokenPayload);
                    // await db.update({ avatar: blob.url, userId });
                } catch (error) {
                    console.error('Error updating user', error);
                    throw new Error('Could not update user');
                }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }, // The webhook will retry 5 times waiting for a 200
        );
    }
}