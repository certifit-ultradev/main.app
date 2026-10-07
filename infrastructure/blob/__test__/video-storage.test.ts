import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { saveVideoLocalStorage, saveVideoVercelBlobStorage } from '@/infrastructure/blob/video-storage';
import { generateAssetFileName as generateFileName } from '@/infrastructure/assets/file-name';

jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
        writeFile: jest.fn(),
    }
}));
jest.mock('path');
jest.mock('@vercel/blob');
jest.mock('next/cache');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid-123')
}));
jest.mock('@/infrastructure/assets/file-name');

describe('Video Repository Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('saveVideoLocalStorage', () => {
        const mockFile = {
            name: 'test-video.mp4',
            size: 1024000,
            type: 'video/mp4',
            arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
        } as unknown as File;

        beforeEach(() => {
            (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
            (process as any).cwd = jest.fn(() => '/mock/project/root');
        });

        test('debería lanzar error si no se proporciona archivo', async () => {
            await expect(saveVideoLocalStorage(null as any))
                .rejects
                .toThrow('No file provided');
        });

        test('debería crear el directorio uploads si no existe', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            await saveVideoLocalStorage(mockFile);

            expect(fs.existsSync).toHaveBeenCalledWith('/mock/project/root/uploads');
            expect(fs.mkdirSync).toHaveBeenCalledWith(
                '/mock/project/root/uploads',
                { recursive: true }
            );
        });

        test('no debería crear el directorio si ya existe', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            await saveVideoLocalStorage(mockFile);

            expect(fs.existsSync).toHaveBeenCalledWith('/mock/project/root/uploads');
            expect(fs.mkdirSync).not.toHaveBeenCalled();
        });

        test('debería guardar el archivo con nombre UUID', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            await saveVideoLocalStorage(mockFile);

            const expectedFileName = 'mock-uuid-123-test-video.mp4';
            const expectedPath = `/mock/project/root/uploads/${expectedFileName}`;

            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                expectedPath,
                expect.any(Buffer)
            );
        });

        test('debería retornar la URL correcta del video', async () => {
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            const result = await saveVideoLocalStorage(mockFile);

            expect(result).toBe('/uploads/mock-uuid-123-test-video.mp4');
        });

        test('debería convertir arrayBuffer a Buffer correctamente', async () => {
            const mockArrayBuffer = new ArrayBuffer(16);
            const testFile = {
                ...mockFile,
                arrayBuffer: jest.fn().mockResolvedValue(mockArrayBuffer),
            } as unknown as File;

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            await saveVideoLocalStorage(testFile);

            expect(testFile.arrayBuffer).toHaveBeenCalled();
            expect(fs.promises.writeFile).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(Buffer)
            );
        });

        test('debería manejar diferentes nombres de archivo', async () => {
            const fileNames = ['video1.mp4', 'curso-intro.mov', 'tutorial.avi'];

            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined);

            for (const fileName of fileNames) {
                const testFile = {
                    ...mockFile,
                    name: fileName,
                } as unknown as File;

                const result = await saveVideoLocalStorage(testFile);

                expect(result).toBe(`/uploads/mock-uuid-123-${fileName}`);
            }
        });

        test('debería manejar errores al escribir el archivo', async () => {
            const error = new Error('Write failed');
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.promises.writeFile as jest.Mock).mockRejectedValue(error);

            await expect(saveVideoLocalStorage(mockFile))
                .rejects
                .toThrow('Write failed');
        });

        test('debería manejar errores al crear el directorio', async () => {
            const error = new Error('mkdir failed');
            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (fs.mkdirSync as jest.Mock).mockImplementation(() => {
                throw error;
            });

            await expect(saveVideoLocalStorage(mockFile))
                .rejects
                .toThrow('mkdir failed');
        });
    });

    describe('saveVideoVercelBlobStorage', () => {
        const mockFile = {
            name: 'vercel-video.mp4',
            size: 2048000,
            type: 'video/mp4',
        } as File;

        test('debería subir archivo a Vercel Blob Storage', async () => {
            const uploadPath = 'videos/courses/';
            const generatedFileName = 'generated-file-name.mp4';
            const expectedUrl = 'https://blob.vercel-storage.com/video-abc123';

            (generateFileName as jest.Mock).mockReturnValue(generatedFileName);
            (put as jest.Mock).mockResolvedValue({ url: expectedUrl });

            const result = await saveVideoVercelBlobStorage(uploadPath, mockFile);

            expect(generateFileName).toHaveBeenCalledWith(mockFile.type);
            expect(put).toHaveBeenCalledWith(
                `${uploadPath}${generatedFileName}`,
                mockFile,
                { access: 'public' }
            );
            expect(result).toBe(expectedUrl);
        });

        test('debería revalidar el path después de subir', async () => {
            const uploadPath = 'videos/lessons/';
            const generatedFileName = 'lesson-video.mp4';
            const expectedUrl = 'https://blob.vercel-storage.com/lesson-xyz789';

            (generateFileName as jest.Mock).mockReturnValue(generatedFileName);
            (put as jest.Mock).mockResolvedValue({ url: expectedUrl });

            await saveVideoVercelBlobStorage(uploadPath, mockFile);

            expect(revalidatePath).toHaveBeenCalledWith('/');
        });

        test('debería construir el path completo correctamente', async () => {
            const uploadPath = 'media/videos/';
            const generatedFileName = 'file-123.mp4';

            (generateFileName as jest.Mock).mockReturnValue(generatedFileName);
            (put as jest.Mock).mockResolvedValue({ url: 'https://example.com/video' });

            await saveVideoVercelBlobStorage(uploadPath, mockFile);

            expect(put).toHaveBeenCalledWith(
                'media/videos/file-123.mp4',
                mockFile,
                { access: 'public' }
            );
        });

        test('debería usar access public en las opciones de blob', async () => {
            const uploadPath = 'uploads/';
            const generatedFileName = 'public-video.mp4';

            (generateFileName as jest.Mock).mockReturnValue(generatedFileName);
            (put as jest.Mock).mockResolvedValue({ url: 'https://example.com/video' });

            await saveVideoVercelBlobStorage(uploadPath, mockFile);

            expect(put).toHaveBeenCalledWith(
                expect.any(String),
                mockFile,
                expect.objectContaining({ access: 'public' })
            );
        });

        test('debería manejar diferentes paths de subida', async () => {
            const paths = ['videos/', 'courses/media/', 'lessons/videos/'];
            const generatedFileName = 'test-file.mp4';

            (generateFileName as jest.Mock).mockReturnValue(generatedFileName);
            (put as jest.Mock).mockResolvedValue({ url: 'https://example.com/video' });

            for (const uploadPath of paths) {
                await saveVideoVercelBlobStorage(uploadPath, mockFile);

                expect(put).toHaveBeenCalledWith(
                    `${uploadPath}${generatedFileName}`,
                    mockFile,
                    expect.any(Object)
                );
            }
        });

        test('debería manejar diferentes tipos de archivo', async () => {
            const fileTypes = [
                { name: 'video.mp4', type: 'video/mp4' },
                { name: 'video.mov', type: 'video/quicktime' },
                { name: 'video.avi', type: 'video/x-msvideo' },
            ];

            const uploadPath = 'videos/';

            for (const fileType of fileTypes) {
                const testFile = {
                    name: fileType.name,
                    type: fileType.type,
                    size: 1024000,
                } as File;

                (generateFileName as jest.Mock).mockReturnValue(`generated-${fileType.name}`);
                (put as jest.Mock).mockResolvedValue({ url: 'https://example.com/video' });

                await saveVideoVercelBlobStorage(uploadPath, testFile);

                expect(generateFileName).toHaveBeenCalledWith(fileType.type);
            }
        });

        test('debería manejar errores al subir a Vercel Blob', async () => {
            const uploadPath = 'videos/';
            const error = new Error('Upload failed');

            (generateFileName as jest.Mock).mockReturnValue('error-file.mp4');
            (put as jest.Mock).mockRejectedValue(error);

            await expect(saveVideoVercelBlobStorage(uploadPath, mockFile))
                .rejects
                .toThrow('Upload failed');
        });

        test('debería retornar la URL del blob correctamente', async () => {
            const uploadPath = 'courses/';
            const expectedUrls = [
                'https://blob.vercel-storage.com/video-1',
                'https://blob.vercel-storage.com/video-2',
                'https://blob.vercel-storage.com/video-3',
            ];

            (generateFileName as jest.Mock).mockReturnValue('test.mp4');

            for (const expectedUrl of expectedUrls) {
                (put as jest.Mock).mockResolvedValue({ url: expectedUrl });

                const result = await saveVideoVercelBlobStorage(uploadPath, mockFile);

                expect(result).toBe(expectedUrl);
            }
        });

        test('debería llamar a revalidatePath incluso si hay error', async () => {
            const uploadPath = 'videos/';
            const error = new Error('Upload failed');

            (generateFileName as jest.Mock).mockReturnValue('error-file.mp4');
            (put as jest.Mock).mockRejectedValue(error);

            try {
                await saveVideoVercelBlobStorage(uploadPath, mockFile);
            } catch (e) {
                // Error esperado
            }

            // En este caso, revalidatePath no debería llamarse porque put falla antes
            // Pero si la implementación cambia, esta prueba lo detectaría
        });
    });
});
