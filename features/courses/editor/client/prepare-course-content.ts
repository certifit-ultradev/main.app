import type { CourseEditorClass, CourseEditorModule } from '../course-editor-form.types';
import { toPersistableCourseEditorModules } from '../course-editor-form.types';
import { uploadEditorAsset } from './blob-assets';

export type VideoUploadCallbacks = {
    onStart?: (moduleIndex: number, classIndex: number) => void;
    onProgress?: (moduleIndex: number, classIndex: number, percentage: number) => void;
    onUploaded?: (moduleIndex: number, classIndex: number, url: string) => void;
    onReused?: (moduleIndex: number, classIndex: number) => void;
};

export type ReusableVideoUpload = { file: File; url: string; reuseUntil?: number };

/** Stable editor identity; neither a duplicate filename nor array position identifies a stored class. */
export function videoUploadCacheKey(
    module: CourseEditorModule,
    lesson: CourseEditorClass,
    moduleIndex: number,
    classIndex: number,
): string {
    const moduleKey = module.id === undefined ? `new:${module.clientKey ?? moduleIndex}` : `saved:${module.id}`;
    const classKey = lesson.id === undefined ? `new:${lesson.clientKey ?? classIndex}` : `saved:${lesson.id}`;
    return `${moduleKey}/${classKey}`;
}

/** Uploads videos under a persisted course ID before sending serializable content. */
export async function prepareCourseContent(
    modules: CourseEditorModule[],
    courseId: number,
    callbacks: VideoUploadCallbacks = {},
    uploadAsset: typeof uploadEditorAsset = uploadEditorAsset,
    reusableUploads: Map<string, ReusableVideoUpload> = new Map(),
) {
    const prepared: CourseEditorModule[] = [];
    for (const [moduleIndex, module] of modules.entries()) {
        const classes: CourseEditorModule['classes'] = [];
        for (const [classIndex, lesson] of module.classes.entries()) {
            const cacheKey = videoUploadCacheKey(module, lesson, moduleIndex, classIndex);
            const cached = reusableUploads.get(cacheKey);
            const canReuse = lesson.video instanceof File && cached?.file === lesson.video
                && (cached.reuseUntil === undefined || cached.reuseUntil > Date.now());
            if (cached && !canReuse) reusableUploads.delete(cacheKey);
            if (lesson.video instanceof File && !canReuse) callbacks.onStart?.(moduleIndex, classIndex);
            const video = lesson.video instanceof File
                ? canReuse ? cached.url : (await uploadAsset(`/courses/${courseId}/`, lesson.video, (percentage) => {
                    callbacks.onProgress?.(moduleIndex, classIndex, percentage);
                })).url
                : lesson.video;
            if (canReuse) callbacks.onReused?.(moduleIndex, classIndex);
            else if (lesson.video instanceof File && typeof video === 'string') {
                callbacks.onUploaded?.(moduleIndex, classIndex, video);
            }
            classes.push({ ...lesson, video, videoSize: lesson.video instanceof File ? lesson.video.size : lesson.videoSize });
        }
        prepared.push({ ...module, classes });
    }
    return { modules: prepared, content: { modules: toPersistableCourseEditorModules(prepared) } };
}
