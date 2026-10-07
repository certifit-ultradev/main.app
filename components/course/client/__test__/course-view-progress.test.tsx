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
            classes: [{ id: 2, courseModuleId: 1, title: 'Primera clase', description: 'Clase', video: 'https://example.com/video.mp4', videoSize: 1, videoDuration: 10 }],
            quiz: { id: 3, courseModuleId: 1, title: 'Primer quiz', description: 'Quiz', questions: [] },
        },
        {
            id: 4, courseId: 10, title: 'Segundo módulo', minRequiredPoints: 1,
            classes: [{ id: 5, courseModuleId: 4, title: 'Siguiente clase', description: 'Clase', video: 'https://example.com/next.mp4', videoSize: 1, videoDuration: 10 }],
            quiz: null,
        },
    ],
    classCompleted: [{ classId: 2, currentVideoTime: 0, isCompleted: false, createdAt: '2025-01-01T00:00:00.000Z' }],
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
});
