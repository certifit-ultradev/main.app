import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, context) {
    const params = await context.params;
    const { filePath } = params;

    if (!filePath) {
        return NextResponse.json({ error: 'No se especificó ningún archivo.' }, { status: 400 });
    }

    const fileRelativePath = Array.isArray(filePath) ? filePath.join('/') : filePath;
    const safeFilePath = path.normalize(fileRelativePath).replace(/^(\.\.[\/\\])+/, '');
    const fileAbsolutePath = path.join(process.cwd(), 'uploads', safeFilePath);

    try {
        if (!fs.existsSync(fileAbsolutePath)) {
            console.error('Archivo no encontrado:', fileAbsolutePath);
            return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
        }

        const stat = fs.statSync(fileAbsolutePath);
        const fileSize = stat.size;
        const ext = path.extname(fileAbsolutePath).toLowerCase();
        let contentType = 'application/octet-stream';

        if (ext === '.mp4') {
            contentType = 'video/mp4';
        } else if (ext === '.webm') {
            contentType = 'video/webm';
        }
        // Agrega más tipos de contenido si es necesario

        const range = req.headers.get('range');

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;
            const fileStream = fs.createReadStream(fileAbsolutePath, { start, end });

            const headers = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': contentType,
            };

            return new NextResponse(fileStream, {
                status: 206,
                headers,
            });
        } else {
            const headers = {
                'Content-Length': fileSize,
                'Content-Type': contentType,
            };

            const fileStream = fs.createReadStream(fileAbsolutePath);

            return new NextResponse(fileStream, {
                status: 200,
                headers,
            });
        }
    } catch (error) {
        console.error('Error al servir el archivo:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}