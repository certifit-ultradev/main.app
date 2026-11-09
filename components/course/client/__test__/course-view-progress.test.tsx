/** @jest-environment jsdom */
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useRouter } from 'next/navigation';
import { ClientCourseView } from '@/components/course/client/course-view';
import { saveClassProgress, saveModuleCompletion } from '@/features/courses/learning/progress-http.client';
import type { StudentCourseDto } from '@/application/courses/student-course.dto';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('next/image', () => () => null);
jest.mock('@/features/courses/learning/progress-http.client', () => ({
    saveClassProgress: jest.fn(), saveModuleCompletion: jest.fn(),
}));
jest.mock('@/components/course/client/quiz-view', () => ({
    ClientQuizView: ({ onQuizFinish }: { onQuizFinish: (score: number, passed: boolean) => void }) => (
        <button data-testid="finish-quiz" onClick={() => onQuizFinish(0, true)}>Terminar quiz</button>
    ),
}));
jest.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const course: StudentCourseDto = {
    canonicalId: 'course-1', title: 'Curso', description: 'Descripción', courseImage: '',
    instructorName: 'Ada', instructorPhoto: '', expiresAt: '2030-01-01T00:00:00.000Z',
    category: null, price: 100,
    modules: [
        {
            id: 1, courseId: 10, title: 'Primer módulo', minRequiredPoints: 1,
            locked: false,
            classes: [{ id: 2, courseModuleId: 1, title: 'Primera clase', description: 'Clase', video: 'https://example.com/video.mp4', videoSize: 1, videoDuration: 10 }],
            quiz: { id: 3, courseModuleId: 1, title: 'Primer quiz', description: 'Quiz', questions: [] },
        },
        {
            id: 4, courseId: 10, title: 'Segundo módulo', minRequiredPoints: 1,
            locked: false,
            classes: [{ id: 5, courseModuleId: 4, title: 'Siguiente clase', description: 'Clase', video: 'https://example.com/next.mp4', videoSize: 1, videoDuration: 10 }],
            quiz: null,
        },
    ],
    classCompleted: [{ classId: 2, currentVideoTime: 0, isCompleted: false, createdAt: '2025-01-01T00:00:00.000Z', lastViewedAt: '2025-01-01T00:00:00.000Z' }],
    moduleCompleted: [], quizCompleted: [],
};

describe('ClientCourseView progress navigation', () => {
    let container: HTMLDivElement;
    let root: Root;
    const refresh = jest.fn();

    beforeEach(async () => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ refresh });
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { value: jest.fn(), configurable: true });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        await act(async () => { root.render(<ClientCourseView data={course} />); });
    });

    afterEach(async () => {
        await act(async () => { root.unmount(); });
        container.remove();
    });

    it('does not show completed video or refresh after a failed save', async () => {
        (saveClassProgress as jest.Mock).mockRejectedValue(new Error('invalid response'));
        const video = container.querySelector('video');
        expect(video).not.toBeNull();

        await act(async () => { video?.dispatchEvent(new Event('ended', { bubbles: true })); });

        expect(refresh).not.toHaveBeenCalled();
        expect(container.textContent).toContain('No se pudo guardar el progreso de la clase');
        expect(container.textContent).not.toContain('¡Video finalizado!');
    });

    it('shows completed video only after a valid save', async () => {
        (saveClassProgress as jest.Mock).mockResolvedValue(undefined);

        await act(async () => { container.querySelector('video')?.dispatchEvent(new Event('ended', { bubbles: true })); });

        expect(refresh).toHaveBeenCalledTimes(1);
        expect(container.textContent).toContain('¡Video finalizado!');
    });

    it('keeps the quiz selected and shows an error if module completion fails', async () => {
        const quizButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Primer quiz'));
        await act(async () => { quizButton?.click(); });
        (saveModuleCompletion as jest.Mock).mockRejectedValue(new Error('invalid response'));

        await act(async () => { container.querySelector<HTMLButtonElement>('[data-testid="finish-quiz"]')?.click(); });

        expect(refresh).not.toHaveBeenCalled();
        expect(container.querySelector('[data-testid="finish-quiz"]')).not.toBeNull();
        expect(container.textContent).toContain('No se pudo guardar la finalización del módulo');
        expect(container.textContent).toContain('Reintentar guardar módulo');
    });

    it('allows retrying a failed module save before advancing', async () => {
        const quizButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Primer quiz'));
        await act(async () => { quizButton?.click(); });
        (saveModuleCompletion as jest.Mock).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);

        await act(async () => { container.querySelector<HTMLButtonElement>('[data-testid="finish-quiz"]')?.click(); });
        expect(refresh).not.toHaveBeenCalled();
        const retry = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Reintentar guardar módulo'));
        await act(async () => { retry?.click(); });

        expect(refresh).toHaveBeenCalledTimes(1);
        expect(container.querySelector('[data-testid="finish-quiz"]')).toBeNull();
        expect(container.textContent).not.toContain('No se pudo guardar la finalización del módulo');
    });

    it('advances to the next module only after the save succeeds', async () => {
        const quizButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Primer quiz'));
        await act(async () => { quizButton?.click(); });
        (saveModuleCompletion as jest.Mock).mockResolvedValue(undefined);

        await act(async () => { container.querySelector<HTMLButtonElement>('[data-testid="finish-quiz"]')?.click(); });

        expect(refresh).toHaveBeenCalledTimes(1);
        expect(container.querySelector('[data-testid="finish-quiz"]')).toBeNull();
        expect(container.textContent).toContain('Siguiente clase');
    });

    it('shows locked modules without navigation until refreshed with an approved quiz', async () => {
        const lockedCourse: StudentCourseDto = {
            ...course,
            modules: [course.modules[0], { ...course.modules[1], locked: true, classes: [], quiz: null }],
        };
        await act(async () => { root.render(<ClientCourseView data={lockedCourse} />); });

        expect(container.textContent).toContain('Aprueba el quiz del módulo anterior');
        expect(container.textContent).not.toContain('Siguiente clase');

        const quizButton = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Primer quiz'));
        await act(async () => { quizButton?.click(); });
        (saveModuleCompletion as jest.Mock).mockResolvedValue(undefined);
        await act(async () => { container.querySelector<HTMLButtonElement>('[data-testid="finish-quiz"]')?.click(); });
        expect(container.textContent).not.toContain('Siguiente clase');

        await act(async () => { root.render(<ClientCourseView data={course} />); });
        expect(container.textContent).toContain('Siguiente clase');
        expect(container.querySelector('video')?.getAttribute('src')).toBe('https://example.com/next.mp4');
    });

    it('restores the latest viewed class and its saved video position on return', async () => {
        await act(async () => { root.unmount(); });
        root = createRoot(container);
        const resumedCourse: StudentCourseDto = {
            ...course,
            classCompleted: [
                course.classCompleted[0],
                { classId: 5, currentVideoTime: 42, isCompleted: false,
                    createdAt: '2025-01-02T00:00:00.000Z', lastViewedAt: '2025-01-03T00:00:00.000Z' },
            ],
        };
        await act(async () => { root.render(<ClientCourseView data={resumedCourse} />); });

        const video = container.querySelector('video');
        expect(video?.getAttribute('src')).toBe('https://example.com/next.mp4');
        if (!video) throw new Error('Expected resumed video');
        Object.defineProperty(video, 'duration', { value: 120, configurable: true });
        await act(async () => { video.dispatchEvent(new Event('loadedmetadata', { bubbles: true })); });
        expect(video.currentTime).toBe(42);
    });

    it('opens the first class for a student without saved class progress', async () => {
        await act(async () => { root.unmount(); });
        root = createRoot(container);
        await act(async () => { root.render(<ClientCourseView data={{ ...course, classCompleted: [] }} />); });
        expect(container.querySelector('video')?.getAttribute('src')).toBe('https://example.com/video.mp4');
    });

    it('persists an explicitly selected class even before the video plays', async () => {
        (saveClassProgress as jest.Mock).mockResolvedValue(undefined);
        const nextClass = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Siguiente clase'));

        await act(async () => { nextClass?.click(); });

        expect(saveClassProgress).toHaveBeenCalledWith({
            canonicalId: 'course-1', classId: 5, currentTime: 0, isCompleted: false,
        });
        expect(container.querySelector('video')?.getAttribute('src')).toBe('https://example.com/next.mp4');
    });

    it('returns to a class revisited in a passed module after reloading the page', async () => {
        await act(async () => { root.unmount(); });
        root = createRoot(container);
        const progressed: StudentCourseDto = {
            ...course,
            classCompleted: [
                { ...course.classCompleted[0], lastViewedAt: '2026-01-01T00:00:00.000Z' },
                { classId: 5, currentVideoTime: 12, isCompleted: false,
                    createdAt: '2026-01-03T00:00:00.000Z', lastViewedAt: '2026-01-03T00:00:00.000Z' },
            ],
            quizCompleted: [{ quizId: 3, courseModuleId: 1, result: 1, retries: 1, passed: true,
                createdAt: '2026-01-02T00:00:00.000Z', lastAttemptAt: '2026-01-02T00:00:00.000Z' }],
        };
        await act(async () => { root.render(<ClientCourseView data={progressed} />); });
        expect(container.querySelector('video')?.getAttribute('src')).toBe('https://example.com/next.mp4');

        (saveClassProgress as jest.Mock).mockResolvedValue(undefined);
        const previousClass = Array.from(container.querySelectorAll('button')).find((button) => button.textContent?.includes('Primera clase'));
        await act(async () => { previousClass?.click(); });
        expect(saveClassProgress).toHaveBeenCalledWith({
            canonicalId: 'course-1', classId: 2, currentTime: 0, isCompleted: false,
        });

        await act(async () => { root.unmount(); });
        root = createRoot(container);
        await act(async () => { root.render(<ClientCourseView data={{ ...progressed, classCompleted: [
            { ...progressed.classCompleted[0], lastViewedAt: '2026-01-04T00:00:00.000Z' },
            progressed.classCompleted[1],
        ] }} />); });
        expect(container.querySelector('video')?.getAttribute('src')).toBe('https://example.com/video.mp4');
    });
});
