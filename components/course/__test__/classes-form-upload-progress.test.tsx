/** @jest-environment jsdom */
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CourseClassesForm } from '@/components/course/classes-form';
import type { CourseEditorFormValues } from '@/features/courses/editor/course-editor-form.types';

const data: CourseEditorFormValues = {
    id: 42, title: 'Curso', price: 1, description: 'Descripción',
    courseImage: '', instructorName: 'Ada', instructorPhoto: '', expiresAt: '2030-01-01', category: null,
    modules: [{
        clientKey: 'module-1', title: 'Módulo', minRequiredPoints: 1,
        classes: [{ clientKey: 'class-1', title: 'Clase', description: 'Descripción', video: null }],
        quiz: { clientKey: 'quiz-1', title: 'Quiz', description: 'Descripción', questions: [] },
    }],
};

describe('CourseClassesForm upload progress', () => {
    it('scrolls to the progress panel when the upload starts', async () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const scrollIntoView = jest.fn();
        const originalScrollIntoView = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = scrollIntoView;
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        const props = { data, setData: jest.fn(), nextStep: jest.fn(), previousStep: jest.fn() };

        try {
            await act(async () => { root.render(<CourseClassesForm {...props} contentPhase="idle" />); });
            expect(scrollIntoView).not.toHaveBeenCalled();

            await act(async () => { root.render(<CourseClassesForm {...props} contentPhase="uploading" isSaving />); });
            expect(container.querySelector('[aria-label="Progreso de videos"]')).not.toBeNull();
            expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
            expect(scrollIntoView).toHaveBeenCalledTimes(1);
        } finally {
            await act(async () => { root.unmount(); });
            container.remove();
            Element.prototype.scrollIntoView = originalScrollIntoView;
        }
    });

    it('shows per-class percentage and distinguishes upload completion from database saving', async () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        await act(async () => { root.render(<CourseClassesForm
            data={data}
            setData={jest.fn()}
            nextStep={jest.fn()}
            previousStep={jest.fn()}
            isSaving
            contentPhase="saving"
            videoUploads={[{
                key: '0:0', moduleIndex: 0, classIndex: 0, fileName: 'lesson.mp4',
                percentage: 100, status: 'uploaded',
            }]}
        />); });

        expect(container.textContent).toContain('Módulo 1, clase 1: lesson.mp4');
        expect(container.textContent).toContain('Subido, pendiente de guardar');
        expect(container.textContent).toContain('Guardando el contenido del curso');
        expect(container.querySelector('progress')?.value).toBe(100);
        await act(async () => { root.unmount(); });
        container.remove();
    });

    it('explains that a completed video remains available for retry', async () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        await act(async () => { root.render(<CourseClassesForm
            data={data}
            setData={jest.fn()}
            nextStep={jest.fn()}
            previousStep={jest.fn()}
            contentPhase="error"
            videoUploads={[{
                key: '0:0', moduleIndex: 0, classIndex: 0, fileName: 'lesson.mp4',
                percentage: 100, status: 'reused',
            }]}
        />); });

        expect(container.textContent).toContain('Se reutilizarán los videos ya subidos');
        expect(container.textContent).toContain('Subido, listo para reintentar');
        await act(async () => { root.unmount(); });
        container.remove();
    });
});
