/** @jest-environment jsdom */
import { upload } from '@vercel/blob/client';
import { uploadEditorAsset } from '@/features/courses/editor/client/blob-assets';

jest.mock('@vercel/blob/client', () => ({ upload: jest.fn() }));

describe('uploadEditorAsset', () => {
    it('forwards byte-upload progress to the editor without exposing the Blob response', async () => {
        const file = new File(['video'], 'lesson.mp4', { type: 'video/mp4' });
        const onProgress = jest.fn();
        (upload as jest.Mock).mockResolvedValue({
            url: 'https://example.com/courses/42/video.mp4', pathname: 'courses/42/video.mp4',
        });

        const result = await uploadEditorAsset('/courses/42/', file, onProgress);

        const [pathname, body, options] = (upload as jest.Mock).mock.calls[0];
        expect(pathname).toMatch(/^\/courses\/42\/.+\.mp4$/);
        expect(body).toBe(file);
        expect(options.multipart).toBe(true);
        options.onUploadProgress({ loaded: 5, total: 10, percentage: 50 });
        expect(onProgress).toHaveBeenCalledWith(50);
        expect(result).toEqual({
            url: 'https://example.com/courses/42/video.mp4', pathname: 'courses/42/video.mp4',
        });
    });
});
