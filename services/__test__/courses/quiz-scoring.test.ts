import { auth } from '@/auth';
import { logPrismaError } from '@/exceptions/error-encoder';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { prismaCourseProgressWritePort } from '@/repository/course-progress.prisma';
import { calculateQuizScore } from '@/services/courses';
import { clearAllMocks, setupMocks } from './setup';

jest.mock('@/auth');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/repository/course-progress.prisma', () => ({
    prismaCourseProgressWritePort: {
        upsertClassProgress: jest.fn(), completeModule: jest.fn(), findQuizQuestion: jest.fn(),
        upsertQuizAnswer: jest.fn(), recordQuizAttempt: jest.fn(),
    },
}));

describe('Courses Service - Quiz Scoring', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
        (prismaCourseProgressWritePort.recordQuizAttempt as jest.Mock)
            .mockImplementation(async (_scope, calculate) => calculate({
                questionCount: 3, minRequiredPoints: 20,
                answers: [{ questionId: 1, points: 10 }, { questionId: 2, points: 10 }, { questionId: 3, points: 0 }],
            }));
    });
    afterEach(clearAllMocks);

    it('calcula puntaje y aprobación en aplicación dentro de la operación atómica', async () => {
        await expect(calculateQuizScore({ canonicalId: 'course-123', moduleId: 3, quizId: 5 }))
            .resolves.toEqual({ questionCount: 3, totalScore: 20, pass: true });

        expect(prismaCourseProgressWritePort.recordQuizAttempt).toHaveBeenCalledWith(
            { userId: 'user-123', canonicalId: 'course-123', moduleId: 3, quizId: 5 }, expect.any(Function),
        );
    });

    it('no permite calcular un quiz sin sesión autenticada', async () => {
        (auth as jest.Mock).mockResolvedValue(null);

        await expect(calculateQuizScore({ canonicalId: 'course-123', moduleId: 3, quizId: 5 })).rejects.toThrow(UserNotLoggedError);
        expect(prismaCourseProgressWritePort.recordQuizAttempt).not.toHaveBeenCalled();
    });

    it('propaga la validación atómica de matrícula, jerarquía o respuestas', async () => {
        const error = new Error('El quiz 5 del módulo no tiene respuesta');
        (prismaCourseProgressWritePort.recordQuizAttempt as jest.Mock).mockRejectedValue(error);

        await expect(calculateQuizScore({ canonicalId: 'course-123', moduleId: 3, quizId: 5 })).rejects.toThrow(error);
        expect(logPrismaError).toHaveBeenCalledWith(error);
    });
});
