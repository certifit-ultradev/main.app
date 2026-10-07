import type { CourseEditorFormValues } from '../course-editor-form.types';
import { calculateCourseVideoDuration, formatCourseVideoDuration } from '@/application/courses/course-video';

type EditorModules = CourseEditorFormValues['modules'];

export const calculateEditorVideoSize = (modules: EditorModules): number => (modules ?? []).reduce(
    (total, module) => total + module.classes.reduce((classTotal, lesson) => (
        classTotal + (lesson.video instanceof File ? lesson.video.size : lesson.videoSize ?? 0)
    ), 0),
    0,
);

export const formatEditorVideoSize = (size: number): string => (size / (1024 * 1024 * 1024)).toFixed(4);

export const calculateEditorVideoDuration = (modules: EditorModules): number => calculateCourseVideoDuration(modules ?? []);
export { formatCourseVideoDuration as formatEditorVideoDuration };
