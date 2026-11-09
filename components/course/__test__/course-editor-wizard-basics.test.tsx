/** @jest-environment jsdom */
import { act, type Dispatch, type SetStateAction } from 'react';
import { createRoot } from 'react-dom/client';
import { CourseEditorWizard } from '@/components/course/course-editor-wizard';
import { getCourseDataById } from '@/actions/courses/list';
import { updateBasics } from '@/actions/courses/register';
import type { CourseEditorFormValues } from '@/features/courses/editor/course-editor-form.types';
import { uploadEditorAsset } from '@/features/courses/editor/client/blob-assets';

jest.mock('next/navigation', () => ({ useRouter: () => ({ replace: jest.fn() }) }));
jest.mock('@/actions/courses/list', () => ({ getCourseDataById: jest.fn() }));
jest.mock('@/actions/courses/register', () => ({
    createDraft: jest.fn(), updateBasics: jest.fn(), saveContent: jest.fn(), queueUnusedAssets: jest.fn(),
}));
jest.mock('@/features/courses/editor/client/blob-assets', () => ({ uploadEditorAsset: jest.fn() }));
jest.mock('@/components/course/basic-form', () => ({
    CourseBasicForm: ({ nextStep, setData }: {
        nextStep: () => Promise<void>;
        setData: Dispatch<SetStateAction<CourseEditorFormValues>>;
    }) => <>
        <button type="button" onClick={nextStep}>Guardar y continuar</button>
        <button type="button" onClick={() => setData((current) => ({ ...current, title: 'Nuevo título' }))}>Cambiar título</button>
        <button type="button" onClick={() => setData((current) => ({ ...current, courseImage: new File(['image'], 'new.png') }))}>Cambiar imagen</button>
    </>,
}));
jest.mock('@/components/course/classes-form', () => ({
    CourseClassesForm: () => <div>Paso de contenido</div>,
}));
jest.mock('@/components/course/review-form', () => ({ CourseReviewForm: () => null }));
jest.mock('@/components/course/progress-form', () => ({ CourseStepProgress: () => null }));

describe('course editor basic step', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        window.history.replaceState(null, '', '/admin/courses/7/edit?step=1');
        (getCourseDataById as jest.Mock).mockResolvedValue({ ok: true, data: {
            id: 7, canonicalId: 'curso', title: 'Curso', price: 100, description: 'Descripción',
            instructorName: 'Ada', category: { id: 2, name: 'Tecnología' },
            expiresAt: '2030-01-01T17:30:00.000Z',
            courseImage: 'https://example.com/course.png', instructorPhoto: 'https://example.com/ada.png',
            modules: [],
        } });
        (updateBasics as jest.Mock).mockResolvedValue({ ok: true, data: null });
        (uploadEditorAsset as jest.Mock).mockResolvedValue({ url: 'https://example.com/new.png' });
    });

    it('advances without posting when an existing course has no basic changes', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        try {
            await act(async () => { root.render(<CourseEditorWizard courseId={7} />); });
            const button = container.querySelector('button');
            expect(button?.textContent).toBe('Guardar y continuar');

            await act(async () => { button?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

            expect(updateBasics).not.toHaveBeenCalled();
            expect(container.textContent).toContain('Paso de contenido');
        } finally {
            await act(async () => { root.unmount(); });
            container.remove();
        }
    });

    it('posts only an edited title and preserves all other persisted fields', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        try {
            await act(async () => { root.render(<CourseEditorWizard courseId={7} />); });
            const changeTitle = Array.from(container.querySelectorAll('button'))
                .find((button) => button.textContent === 'Cambiar título');
            await act(async () => { changeTitle?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
            const save = Array.from(container.querySelectorAll('button'))
                .find((button) => button.textContent === 'Guardar y continuar');
            await act(async () => { save?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

            expect(updateBasics).toHaveBeenCalledTimes(1);
            expect(updateBasics).toHaveBeenCalledWith({ courseId: 7, basics: { title: 'Nuevo título' } });
        } finally {
            await act(async () => { root.unmount(); });
            container.remove();
        }
    });

    it('saves only the newly uploaded image URL without replacing other basic fields', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);

        try {
            await act(async () => { root.render(<CourseEditorWizard courseId={7} />); });
            const changeImage = Array.from(container.querySelectorAll('button'))
                .find((button) => button.textContent === 'Cambiar imagen');
            await act(async () => { changeImage?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
            const save = Array.from(container.querySelectorAll('button'))
                .find((button) => button.textContent === 'Guardar y continuar');
            await act(async () => { save?.dispatchEvent(new MouseEvent('click', { bubbles: true })); });

            expect(uploadEditorAsset).toHaveBeenCalledTimes(1);
            expect(updateBasics).toHaveBeenCalledTimes(1);
            expect(updateBasics).toHaveBeenCalledWith({ courseId: 7, basics: { courseImage: 'https://example.com/new.png' } });
        } finally {
            await act(async () => { root.unmount(); });
            container.remove();
        }
    });
});
