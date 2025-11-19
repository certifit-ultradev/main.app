import { uploadFile, generateFileName } from '../upload-file-blob';
import { upload } from '@vercel/blob/client';
import { v4 as uuidv4 } from 'uuid';

jest.mock('@vercel/blob/client');
jest.mock('uuid');

describe('utils/upload-file-blob', () => {
    const mockUpload = upload as jest.MockedFunction<typeof upload>;
    const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('generateFileName', () => {
        beforeEach(() => {
            mockUuidv4.mockReturnValue('test-uuid-1234');
        });

        it('should generate .mp4 filename for video/mp4 type', () => {
            const result = generateFileName('video/mp4');

            expect(result).toBe('test-uuid-1234.mp4');
            expect(mockUuidv4).toHaveBeenCalledTimes(1);
        });

        it('should generate .png filename for image/png type', () => {
            const result = generateFileName('image/png');

            expect(result).toBe('test-uuid-1234.png');
        });

        it('should generate .jpg filename for image/jpeg type', () => {
            const result = generateFileName('image/jpeg');

            expect(result).toBe('test-uuid-1234.jpg');
        });

        it('should throw error for invalid format', () => {
            expect(() => generateFileName('application/pdf')).toThrow('Formato invalido');
        });

        it('should throw error for empty string', () => {
            expect(() => generateFileName('')).toThrow('Formato invalido');
        });

        it('should throw error for unsupported video format', () => {
            expect(() => generateFileName('video/avi')).toThrow('Formato invalido');
        });

        it('should throw error for unsupported image format', () => {
            expect(() => generateFileName('image/gif')).toThrow('Formato invalido');
        });

        it('should generate different filenames on multiple calls', () => {
            mockUuidv4
                .mockReturnValueOnce('uuid-1')
                .mockReturnValueOnce('uuid-2')
                .mockReturnValueOnce('uuid-3');

            const file1 = generateFileName('video/mp4');
            const file2 = generateFileName('image/png');
            const file3 = generateFileName('image/jpeg');

            expect(file1).toBe('uuid-1.mp4');
            expect(file2).toBe('uuid-2.png');
            expect(file3).toBe('uuid-3.jpg');
        });
    });

    describe('uploadFile', () => {
        const mockFile = new File(['content'], 'test.mp4', { type: 'video/mp4' });
        const mockPutBlobResult: any = {
            url: 'https://blob.vercel-storage.com/test-uuid-1234.mp4',
            downloadUrl: 'https://blob.vercel-storage.com/test-uuid-1234.mp4',
            pathname: 'videos/test-uuid-1234.mp4',
            contentType: 'video/mp4',
            contentDisposition: 'attachment; filename="test-uuid-1234.mp4"',
        };

        beforeEach(() => {
            mockUuidv4.mockReturnValue('test-uuid-1234');
            mockUpload.mockResolvedValue(mockPutBlobResult);
        });

        it('should upload file with generated path', async () => {
            const pathName = 'videos/';
            const result = await uploadFile(pathName, mockFile);

            expect(mockUpload).toHaveBeenCalledWith(
                'videos/test-uuid-1234.mp4',
                mockFile,
                expect.objectContaining({
                    access: 'public',
                    handleUploadUrl: '/api/blob-upload',
                    multipart: true,
                })
            );
            expect(result).toEqual(mockPutBlobResult);
        });

        it('should configure upload with public access', async () => {
            await uploadFile('images/', mockFile);

            expect(mockUpload).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(File),
                expect.objectContaining({
                    access: 'public',
                })
            );
        });

        it('should configure upload with multipart option', async () => {
            await uploadFile('videos/', mockFile);

            expect(mockUpload).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(File),
                expect.objectContaining({
                    multipart: true,
                })
            );
        });

        it('should use correct blob upload API endpoint', async () => {
            await uploadFile('uploads/', mockFile);

            expect(mockUpload).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(File),
                expect.objectContaining({
                    handleUploadUrl: '/api/blob-upload',
                })
            );
        });

        it('should include onUploadProgress callback', async () => {
            await uploadFile('videos/', mockFile);

            const uploadOptions = mockUpload.mock.calls[0][2];
            expect(uploadOptions).toHaveProperty('onUploadProgress');
            expect(typeof uploadOptions?.onUploadProgress).toBe('function');
        });

        it('should log upload progress', async () => {
            await uploadFile('videos/', mockFile);

            const uploadOptions = mockUpload.mock.calls[0][2];
            uploadOptions?.onUploadProgress?.({ percentage: 50, loaded: 500, total: 1000 });

            expect(console.log).toHaveBeenCalledWith('Upload progress:', 50);
        });

        it('should handle PNG image upload', async () => {
            const pngFile = new File(['content'], 'test.png', { type: 'image/png' });
            mockUuidv4.mockReturnValue('image-uuid');

            await uploadFile('images/', pngFile);

            expect(mockUpload).toHaveBeenCalledWith(
                'images/image-uuid.png',
                pngFile,
                expect.any(Object)
            );
        });

        it('should handle JPEG image upload', async () => {
            const jpegFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
            mockUuidv4.mockReturnValue('jpeg-uuid');

            await uploadFile('thumbnails/', jpegFile);

            expect(mockUpload).toHaveBeenCalledWith(
                'thumbnails/jpeg-uuid.jpg',
                jpegFile,
                expect.any(Object)
            );
        });

        it('should concatenate pathname with generated filename', async () => {
            mockUuidv4.mockReturnValue('file-123');

            await uploadFile('path/to/uploads/', mockFile);

            expect(mockUpload).toHaveBeenCalledWith(
                'path/to/uploads/file-123.mp4',
                mockFile,
                expect.any(Object)
            );
        });

        it('should return PutBlobResult from upload', async () => {
            const result = await uploadFile('videos/', mockFile);

            expect(result).toHaveProperty('url');
            expect(result).toHaveProperty('downloadUrl');
            expect(result).toHaveProperty('pathname');
            expect(result).toHaveProperty('contentType');
        });

        it('should throw error for invalid file type', async () => {
            const invalidFile = new File(['content'], 'doc.pdf', { type: 'application/pdf' });

            await expect(uploadFile('docs/', invalidFile)).rejects.toThrow('Formato invalido');
        });
    });
});
