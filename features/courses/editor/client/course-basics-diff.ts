import type { CourseEditorFormValues } from '../course-editor-form.types';

type BasicFields = Pick<CourseEditorFormValues,
    'title' | 'price' | 'instructorName' | 'category' | 'description' | 'expiresAt'
>;

export type StoredCourseBasics = BasicFields & {
    courseImage: string;
    instructorPhoto: string;
};

/** Snapshot of values actually persisted, not pending browser File objects. */
export function snapshotCourseBasics(form: CourseEditorFormValues): StoredCourseBasics {
    return {
        title: form.title,
        price: form.price,
        instructorName: form.instructorName,
        category: form.category ? { ...form.category } : null,
        description: form.description,
        expiresAt: form.expiresAt,
        courseImage: typeof form.courseImage === 'string' ? form.courseImage : '',
        instructorPhoto: typeof form.instructorPhoto === 'string' ? form.instructorPhoto : '',
    };
}

/** Only changed form fields cross the edit action; selected Files upload separately. */
export function diffCourseBasics(form: CourseEditorFormValues, saved: StoredCourseBasics): Partial<StoredCourseBasics> {
    const changed: Partial<StoredCourseBasics> = {};
    if (form.title !== saved.title) changed.title = form.title;
    if (form.price !== saved.price) changed.price = form.price;
    if (form.instructorName !== saved.instructorName) changed.instructorName = form.instructorName;
    if (form.category?.id !== saved.category?.id && form.category) changed.category = form.category;
    if (form.description !== saved.description) changed.description = form.description;
    if (form.expiresAt !== saved.expiresAt) changed.expiresAt = form.expiresAt;
    if (typeof form.courseImage === 'string' && form.courseImage !== saved.courseImage) {
        changed.courseImage = form.courseImage;
    }
    if (typeof form.instructorPhoto === 'string' && form.instructorPhoto !== saved.instructorPhoto) {
        changed.instructorPhoto = form.instructorPhoto;
    }
    return changed;
}
