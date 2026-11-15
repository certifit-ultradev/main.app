import { prepareCourseContent, videoUploadCacheKey } from '@/features/courses/editor/client/prepare-course-content';
import type { CourseEditorModule } from '@/features/courses/editor/course-editor-form.types';

describe('prepareCourseContent', () => {
    it('uploads each video under the persisted course ID without matching by filename or index-derived DB IDs', async () => {
        const first = new File(['one'], 'lesson.mp4', { type: 'video/mp4' });
        const second = new File(['two'], 'lesson.mp4', { type: 'video/mp4' });
        const modules: CourseEditorModule[] = [{
            clientKey: 'module-a', title: 'Primer módulo', minRequiredPoints: 1,
            classes: [
                { clientKey: 'class-a', title: 'Primera', description: 'Texto', video: first },
                { clientKey: 'class-b', title: 'Segunda', description: 'Texto', video: second },
            ],
            quiz: { title: 'Quiz', description: 'Texto', questions: [{
                type: 'text', title: 'Pregunta', points: 1, expectedAnswer: { value: 'Respuesta' },
            }] },
        }];
        let count = 0;
        const upload = jest.fn(async (_path: string, _file: File, onProgress?: (percentage: number) => void) => {
            onProgress?.(35);
            return { url: `https://example.com/video-${++count}.mp4`, pathname: `video-${count}.mp4` };
        });
        const onStart = jest.fn();
        const onProgress = jest.fn();
        const onVideoUploaded = jest.fn();

        const result = await prepareCourseContent(modules, 42, {
            onStart, onProgress, onUploaded: onVideoUploaded,
        }, upload);

        expect(upload).toHaveBeenNthCalledWith(1, '/courses/42/', first, expect.any(Function));
        expect(upload).toHaveBeenNthCalledWith(2, '/courses/42/', second, expect.any(Function));
        expect(onStart.mock.calls).toEqual([[0, 0], [0, 1]]);
        expect(onProgress.mock.calls).toEqual([[0, 0, 35], [0, 1, 35]]);
        expect(onVideoUploaded).toHaveBeenNthCalledWith(1, 0, 0, 'https://example.com/video-1.mp4');
        expect(onVideoUploaded).toHaveBeenNthCalledWith(2, 0, 1, 'https://example.com/video-2.mp4');
        expect(result.content.modules[0].classes.map((lesson) => lesson.video)).toEqual([
            'https://example.com/video-1.mp4', 'https://example.com/video-2.mp4',
        ]);
        expect(JSON.stringify(result.content)).not.toContain('clientKey');
        expect(modules[0].classes[0].video).toBe(first);
    });

    it('reuses only the URL for the same class and File while uploading other videos', async () => {
        const first = new File(['one'], 'lesson.mp4', { type: 'video/mp4' });
        const second = new File(['two'], 'lesson.mp4', { type: 'video/mp4' });
        const module: CourseEditorModule = {
            clientKey: 'module-a', title: 'Módulo', minRequiredPoints: 1,
            classes: [
                { clientKey: 'class-a', title: 'Primera', description: 'Texto', video: first },
                { clientKey: 'class-b', title: 'Segunda', description: 'Texto', video: second },
            ],
            quiz: { title: 'Quiz', description: 'Texto', questions: [] },
        };
        const cachedUrl = 'https://example.com/cached.mp4';
        const cache = new Map([[videoUploadCacheKey(module, module.classes[0], 0, 0), {
            file: first, url: cachedUrl, reuseUntil: Date.now() + 60_000,
        }]]);
        const upload = jest.fn(async () => ({ url: 'https://example.com/new.mp4', pathname: 'new.mp4' }));
        const onReused = jest.fn();
        const onUploaded = jest.fn();

        const result = await prepareCourseContent([module], 42, { onReused, onUploaded }, upload, cache);

        expect(upload).toHaveBeenCalledTimes(1);
        expect(upload).toHaveBeenCalledWith('/courses/42/', second, expect.any(Function));
        expect(onReused).toHaveBeenCalledWith(0, 0);
        expect(onUploaded).toHaveBeenCalledWith(0, 1, 'https://example.com/new.mp4');
        expect(result.content.modules[0].classes.map((lesson) => lesson.video)).toEqual([cachedUrl, 'https://example.com/new.mp4']);
    });

    it('uploads again when the cached URL expired or the selected File changed', async () => {
        const file = new File(['new'], 'lesson.mp4', { type: 'video/mp4' });
        const module: CourseEditorModule = {
            clientKey: 'module-a', title: 'Módulo', minRequiredPoints: 1,
            classes: [{ clientKey: 'class-a', title: 'Clase', description: 'Texto', video: file }],
            quiz: { title: 'Quiz', description: 'Texto', questions: [] },
        };
        const key = videoUploadCacheKey(module, module.classes[0], 0, 0);
        const upload = jest.fn(async () => ({ url: 'https://example.com/new.mp4', pathname: 'new.mp4' }));
        const oldFile = new File(['old'], 'lesson.mp4', { type: 'video/mp4' });
        const cache = new Map([[key, { file: oldFile, url: 'https://example.com/old.mp4', reuseUntil: Date.now() + 60_000 }]]);

        await prepareCourseContent([module], 42, {}, upload, cache);
        expect(upload).toHaveBeenCalledTimes(1);
        expect(cache.has(key)).toBe(false);

        cache.set(key, { file, url: 'https://example.com/expired.mp4', reuseUntil: Date.now() - 1 });
        await prepareCourseContent([module], 42, {}, upload, cache);
        expect(upload).toHaveBeenCalledTimes(2);
    });
});
