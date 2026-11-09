/** @jest-environment jsdom */
import { diffCourseBasics, snapshotCourseBasics } from '@/features/courses/editor/client/course-basics-diff';
import type { CourseEditorFormValues } from '@/features/courses/editor/course-editor-form.types';

const form: CourseEditorFormValues = {
    id: 7, title: 'Curso', price: 100, description: 'Descripción', instructorName: 'Ada',
    category: { id: 2, name: 'Tecnología' }, expiresAt: '2030-01-01',
    courseImage: 'https://example.com/course.png', instructorPhoto: 'https://example.com/ada.png',
    modules: [],
};

describe('course basic field diff', () => {
    it('does not write unchanged fields, even when category objects have different identities', () => {
        const saved = snapshotCourseBasics(form);
        expect(diffCourseBasics({ ...form, category: { id: 2, name: 'Categoría renombrada' } }, saved)).toEqual({});
    });

    it('sends only changed fields and leaves existing image URLs alone while a File is pending', () => {
        const saved = snapshotCourseBasics(form);
        const next = { ...form, title: 'Nuevo nombre', courseImage: new File(['image'], 'new.png') };
        expect(diffCourseBasics(next, saved)).toEqual({ title: 'Nuevo nombre' });
    });

    it('includes a changed date or persisted URL only when explicitly modified', () => {
        const saved = snapshotCourseBasics(form);
        expect(diffCourseBasics({ ...form, expiresAt: '2031-02-03', instructorPhoto: 'https://example.com/new.png' }, saved)).toEqual({
            expiresAt: '2031-02-03', instructorPhoto: 'https://example.com/new.png',
        });
    });
});
