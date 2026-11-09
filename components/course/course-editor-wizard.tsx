'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCourseDataById } from '@/actions/courses/list';
import { createDraft, queueUnusedAssets, saveContent, updateBasics } from '@/actions/courses/register';
import { CourseBasicForm } from './basic-form';
import { CourseClassesForm, type VideoUploadStatus } from './classes-form';
import { CourseReviewForm } from './review-form';
import { CourseStepProgress } from './progress-form';
import { createEditorModule } from '@/features/courses/editor/course-editor-modules.reducer';
import { toCourseEditorFormValues } from '@/features/courses/editor/course-editor-form.mapper';
import type { CourseEditorFormValues, CourseEditorModule } from '@/features/courses/editor/course-editor-form.types';
import {
    prepareCourseContent,
    videoUploadCacheKey,
    type ReusableVideoUpload,
} from '@/features/courses/editor/client/prepare-course-content';
import { uploadEditorAsset } from '@/features/courses/editor/client/blob-assets';
import { cn } from '@/lib/utils';
import { safeLogger } from '@/shared/observability/safe-logger';
import { COURSE_ASSET_REUSE_WINDOW_MS } from '@/shared/course-assets';
import { diffCourseBasics, snapshotCourseBasics, type StoredCourseBasics } from '@/features/courses/editor/client/course-basics-diff';

const emptyCourse = (): CourseEditorFormValues => ({
    title: '', price: 0, courseImage: '', instructorName: '', instructorPhoto: '',
    category: null, description: '', expiresAt: '', modules: [createEditorModule()],
});

const videoUploadKey = (moduleIndex: number, classIndex: number) => `${moduleIndex}:${classIndex}`;
const errorName = (error: unknown) => error instanceof Error ? error.name : 'unknown';

async function queueFailedUploads(courseId: number, urls: string[]) {
    if (urls.length === 0) return;
    try {
        const result = await queueUnusedAssets({ courseId, urls });
        if (!result.ok) safeLogger.error('course.editor.cleanup_queue.failed', { courseId, code: result.error.code });
    } catch (error) {
        safeLogger.error('course.editor.cleanup_queue.failed', { courseId, name: errorName(error) });
    }
}

export function CourseEditorWizard({ courseId }: { courseId?: number }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState<CourseEditorFormValues>(emptyCourse);
    const [isLoading, setIsLoading] = useState(courseId !== undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [loadError, setLoadError] = useState('');
    const [isActive, setIsActive] = useState(false);
    const savedBasicsRef = useRef<StoredCourseBasics | null>(null);
    const [videoUploads, setVideoUploads] = useState<VideoUploadStatus[]>([]);
    const [contentPhase, setContentPhase] = useState<'idle' | 'uploading' | 'saving' | 'error'>('idle');
    const reusableVideos = useRef(new Map<string, ReusableVideoUpload>());

    useEffect(() => {
        if (courseId === undefined) return;
        if (!Number.isInteger(courseId) || courseId <= 0) {
            setLoadError('El identificador del curso no es válido.');
            setIsLoading(false);
            return;
        }
        let live = true;
        const load = async () => {
            try {
                const result = await getCourseDataById({ id: courseId });
                if (!live) return;
                if (!result.ok) {
                    setLoadError(result.error.message);
                    return;
                }
                const form = toCourseEditorFormValues(result.data);
                setIsActive(result.data.isActive ?? false);
                setData({ ...form, modules: form.modules.length ? form.modules : [createEditorModule()] });
                savedBasicsRef.current = snapshotCourseBasics(form);
                const requested = Number(new URLSearchParams(window.location.search).get('step'));
                setStep(requested === 2 || (requested === 3 && result.data.modules.length > 0) ? requested : 1);
                if (new URLSearchParams(window.location.search).has('uploadError')) {
                    setSaveError('El borrador se guardó, pero faltó subir alguna imagen. Selecciónala de nuevo para continuar.');
                }
            } catch (error) {
                safeLogger.error('course.editor.load.failed', { courseId, name: errorName(error) });
                if (live) setLoadError('No fue posible cargar el curso. Intenta recargar la página.');
            } finally {
                if (live) setIsLoading(false);
            }
        };
        void load();
        return () => { live = false; };
    }, [courseId]);

    const goToStep = (next: number) => {
        setSaveError('');
        setStep(next);
        const id = data.id ?? courseId;
        if (id && typeof window !== 'undefined') {
            window.history.replaceState(null, '', `/admin/courses/${id}/edit?step=${next}`);
        }
    };

    const saveBasics = async () => {
        if (isSaving || !data.category) return;
        setIsSaving(true);
        setSaveError('');
        let id = data.id ?? courseId;
        const uploadedUrls: string[] = [];
        let phase = id ? 'update_basics' : 'create_draft';
        try {
            const basics = {
                title: data.title, price: data.price, description: data.description,
                instructorName: data.instructorName, category: data.category, expiresAt: data.expiresAt,
                courseImage: typeof data.courseImage === 'string' ? data.courseImage : savedBasicsRef.current?.courseImage ?? '',
                instructorPhoto: typeof data.instructorPhoto === 'string' ? data.instructorPhoto : savedBasicsRef.current?.instructorPhoto ?? '',
            };
            if (!id) {
                const draftKey = window.sessionStorage.getItem('course-draft-key') ?? crypto.randomUUID();
                window.sessionStorage.setItem('course-draft-key', draftKey);
                const created = await createDraft({ ...basics, draftKey });
                if (!created.ok) {
                    safeLogger.error('course.editor.draft.rejected', { code: created.error.code });
                    throw new Error(created.error.message);
                }
                id = created.data.id;
                setData((current) => ({ ...current, id }));
                savedBasicsRef.current = snapshotCourseBasics({ ...data, ...basics });
            } else {
                const savedBasics = savedBasicsRef.current;
                if (!savedBasics) throw new Error('No fue posible identificar los datos guardados del curso.');
                const changedBasics = diffCourseBasics(data, savedBasics);
                if (Object.keys(changedBasics).length > 0) {
                    const initialSave = await updateBasics({ courseId: id, basics: changedBasics });
                    if (!initialSave.ok) {
                        safeLogger.error('course.editor.basics.rejected', { courseId: id, code: initialSave.error.code });
                        throw new Error(initialSave.error.message);
                    }
                    savedBasicsRef.current = { ...savedBasics, ...changedBasics };
                }
            }
            if (data.courseImage instanceof File) {
                phase = 'upload_course_image';
                const uploaded = await uploadEditorAsset(`/courses/${id}/`, data.courseImage);
                uploadedUrls.push(uploaded.url);
                phase = 'save_course_image';
                const updated = await updateBasics({ courseId: id, basics: { courseImage: uploaded.url } });
                if (!updated.ok) {
                    safeLogger.error('course.editor.course_image.rejected', { courseId: id, code: updated.error.code });
                    throw new Error(updated.error.message);
                }
                if (savedBasicsRef.current) savedBasicsRef.current = { ...savedBasicsRef.current, courseImage: uploaded.url };
                setData((current) => ({ ...current, courseImage: uploaded.url }));
            }
            if (data.instructorPhoto instanceof File) {
                phase = 'upload_instructor_photo';
                const uploaded = await uploadEditorAsset(`/courses/${id}/`, data.instructorPhoto);
                uploadedUrls.push(uploaded.url);
                phase = 'save_instructor_photo';
                const updated = await updateBasics({ courseId: id, basics: { instructorPhoto: uploaded.url } });
                if (!updated.ok) {
                    safeLogger.error('course.editor.instructor_photo.rejected', { courseId: id, code: updated.error.code });
                    throw new Error(updated.error.message);
                }
                if (savedBasicsRef.current) savedBasicsRef.current = { ...savedBasicsRef.current, instructorPhoto: uploaded.url };
                setData((current) => ({ ...current, instructorPhoto: uploaded.url }));
            }
            if (!courseId) {
                window.sessionStorage.removeItem('course-draft-key');
                router.replace(`/admin/courses/${id}/edit?step=2`);
            }
            else goToStep(2);
        } catch (error) {
            safeLogger.error('course.editor.basics.failed', { phase, courseId: id, name: errorName(error) });
            if (id) await queueFailedUploads(id, uploadedUrls);
            if (!courseId && id) {
                window.sessionStorage.removeItem('course-draft-key');
                router.replace(`/admin/courses/${id}/edit?step=1&uploadError=1`);
            }
            else setSaveError(error instanceof Error ? error.message : 'No fue posible guardar el borrador.');
        } finally {
            setIsSaving(false);
        }
    };

    const saveModules = async (modules: CourseEditorModule[]) => {
        const id = data.id ?? courseId;
        if (isSaving || !id) return;
        setIsSaving(true);
        setSaveError('');
        setContentPhase('uploading');
        setVideoUploads(modules.flatMap((module, moduleIndex) => module.classes.flatMap((lesson, classIndex) =>
            lesson.video instanceof File ? [{
                key: videoUploadKey(moduleIndex, classIndex),
                moduleIndex, classIndex, fileName: lesson.video.name,
                percentage: 0, status: 'pending' as const,
            }] : [],
        )));
        let phase = 'upload_videos';
        const updateVideoUpload = (moduleIndex: number, classIndex: number, patch: Partial<VideoUploadStatus>) => {
            const key = videoUploadKey(moduleIndex, classIndex);
            setVideoUploads((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item));
        };
        try {
            const prepared = await prepareCourseContent(modules, id, {
                onStart: (moduleIndex, classIndex) => updateVideoUpload(moduleIndex, classIndex, { status: 'uploading', percentage: 0 }),
                onProgress: (moduleIndex, classIndex, percentage) => updateVideoUpload(moduleIndex, classIndex, {
                    percentage: Math.min(100, Math.max(0, Math.round(percentage))),
                }),
                onUploaded: (moduleIndex, classIndex, url) => {
                    const module = modules[moduleIndex];
                    const lesson = module.classes[classIndex];
                    if (lesson.video instanceof File) {
                        reusableVideos.current.set(videoUploadCacheKey(module, lesson, moduleIndex, classIndex), {
                            file: lesson.video, url,
                        });
                    }
                    updateVideoUpload(moduleIndex, classIndex, { status: 'uploaded', percentage: 100 });
                },
                onReused: (moduleIndex, classIndex) => updateVideoUpload(moduleIndex, classIndex, {
                    status: 'reused', percentage: 100,
                }),
            }, uploadEditorAsset, reusableVideos.current);
            phase = 'save_content';
            setContentPhase('saving');
            const saved = await saveContent({ courseId: id, content: prepared.content });
            if (!saved.ok) {
                safeLogger.error('course.editor.content.rejected', { courseId: id, code: saved.error.code });
                throw new Error(saved.error.message);
            }
            const savedForm = toCourseEditorFormValues(saved.data);
            savedBasicsRef.current = snapshotCourseBasics(savedForm);
            setData(savedForm);
            setIsActive(saved.data.isActive ?? false);
            reusableVideos.current.clear();
            setContentPhase('idle');
            setVideoUploads([]);
            goToStep(3);
        } catch (error) {
            safeLogger.error('course.editor.content.failed', { phase, courseId: id, name: errorName(error) });
            const retryableUrls: string[] = [];
            for (const [moduleIndex, module] of modules.entries()) {
                for (const [classIndex, lesson] of module.classes.entries()) {
                    if (!(lesson.video instanceof File)) continue;
                    const cached = reusableVideos.current.get(videoUploadCacheKey(module, lesson, moduleIndex, classIndex));
                    if (!cached || cached.file !== lesson.video) continue;
                    cached.reuseUntil ??= Date.now() + COURSE_ASSET_REUSE_WINDOW_MS;
                    retryableUrls.push(cached.url);
                }
            }
            await queueFailedUploads(id, retryableUrls);
            // Keep File identity for validation and a bounded URL cache for retries.
            // After the reuse window, the original File is uploaded again rather
            // than risk referencing a Blob that the cleanup worker has deleted.
            setData((current) => ({ ...current, modules }));
            setVideoUploads((current) => current.map((item) => {
                const module = modules[item.moduleIndex];
                const lesson = module.classes[item.classIndex];
                const cached = reusableVideos.current.get(videoUploadCacheKey(module, lesson, item.moduleIndex, item.classIndex));
                return cached?.file === lesson.video && (cached.reuseUntil ?? 0) > Date.now()
                    ? { ...item, status: 'reused', percentage: 100 }
                    : { ...item, status: 'retry', percentage: 0 };
            }));
            setContentPhase('error');
            setSaveError(error instanceof Error ? error.message : 'No fue posible guardar el contenido.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <p className="p-6">Cargando curso...</p>;
    if (loadError) return <p role="alert" className="p-6 text-red-600">{loadError}</p>;

    return (
        <div className={cn('mt-10 items-center justify-center')}>
            <div className={cn('flex flex-col lg:flex-row gap-8 p-6 mx-auto w-full max-w-lg min-w-0 md:min-w-[50rem] lg:min-w-[110rem]')}>
                <CourseStepProgress currentStep={step} />
                {step === 1 && <CourseBasicForm data={data} setData={setData} nextStep={saveBasics} isSaving={isSaving} saveError={saveError} />}
                {step === 2 && <CourseClassesForm data={data} setData={setData} nextStep={saveModules} previousStep={() => goToStep(1)} isSaving={isSaving} saveError={saveError} videoUploads={videoUploads} contentPhase={contentPhase} />}
                {step === 3 && <CourseReviewForm data={data} isActive={isActive} previousStep={() => goToStep(2)} />}
            </div>
        </div>
    );
}
