import { auth } from '@/auth';
import { logPrismaError } from '@/exceptions/error-encoder';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { prismaCourseProgressWritePort } from '@/repository/course-progress.prisma';
import { registerQuestionAnswer } from '@/services/courses';
import { clearAllMocks, setupMocks } from './setup';

jest.mock('@/auth');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/repository/course-progress.prisma', () => ({
    prismaCourseProgressWritePort: {
        upsertClassProgress: jest.fn(), completeModule: jest.fn(), findQuizQuestion: jest.fn(),
        upsertQuizAnswer: jest.fn(), recordQuizAttempt: jest.fn(),
    },
}));

const multipleQuestion = {
    id: 10, type: 'multiple' as const, points: 10,
    options: [
        { id: 20, value: 'Correcta', isCorrect: true },
        { id: 21, value: 'Incorrecta', isCorrect: false },
    ],
};

describe('Courses Service - Quiz Answer Registration', () => {
    beforeEach(() => setupMocks(logPrismaError as jest.Mock, auth as jest.Mock));
    afterEach(clearAllMocks);

    it('calcula en aplicación y persiste una respuesta de selección por alcance', async () => {
        (prismaCourseProgressWritePort.findQuizQuestion as jest.Mock).mockResolvedValue(multipleQuestion);
        await expect(registerQuestionAnswer({
            canonicalId: 'course-123', moduleId: 3, quizId: 5, questionId: 10,
            kind: 'multiple_choice', optionId: 20,
        })).resolves.toEqual({ success: true });

        expect(prismaCourseProgressWritePort.upsertQuizAnswer).toHaveBeenCalledWith(
            { userId: 'user-123', canonicalId: 'course-123', moduleId: 3, quizId: 5, questionId: 10 },
            { answer: 'Correcta', correct: 'Correcta', isCorrect: true, points: 10 },
        );
    });

    it('calcula la corrección de texto sin aceptar optionId ficticio', async () => {
        (prismaCourseProgressWritePort.findQuizQuestion as jest.Mock).mockResolvedValue({
            id: 10, type: 'text', points: 8,
            expectedAnswer: 'Respuesta Correcta',
        });

        await registerQuestionAnswer({
            canonicalId: 'course-123', moduleId: 3, quizId: 5, questionId: 10,
            kind: 'text', answer: 'Respuesta Correcta',
        });

        expect(prismaCourseProgressWritePort.upsertQuizAnswer).toHaveBeenCalledWith(
            expect.any(Object),
            { answer: 'Respuesta Correcta', correct: 'Respuesta Correcta', isCorrect: true, points: 8 },
        );
    });

    it('rechaza una pregunta que no pertenece al alcance solicitado', async () => {
        (prismaCourseProgressWritePort.findQuizQuestion as jest.Mock).mockResolvedValue(null);

        await expect(registerQuestionAnswer({
            canonicalId: 'course-123', moduleId: 3, quizId: 5, questionId: 10,
            kind: 'text', answer: 'x',
        })).rejects.toThrow('Pregunta inválida para el quiz');
        expect(prismaCourseProgressWritePort.upsertQuizAnswer).not.toHaveBeenCalled();
    });

    it('rechaza una variante de respuesta que no corresponde al tipo de pregunta', async () => {
        (prismaCourseProgressWritePort.findQuizQuestion as jest.Mock).mockResolvedValue(multipleQuestion);

        await expect(registerQuestionAnswer({
            canonicalId: 'course-123', moduleId: 3, quizId: 5, questionId: 10,
            kind: 'text', answer: 'Correcta',
        })).rejects.toThrow('El tipo de respuesta no coincide con la pregunta');
    });

    it('no permite registrar respuestas sin sesión autenticada', async () => {
        (auth as jest.Mock).mockResolvedValue(null);

        await expect(registerQuestionAnswer({} as never)).rejects.toThrow(UserNotLoggedError);
        expect(prismaCourseProgressWritePort.findQuizQuestion).not.toHaveBeenCalled();
    });
});
