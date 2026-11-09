import { auth } from '@/auth';
import { logPrismaError } from '@/exceptions/error-encoder';
import { UserNotLoggedError } from '@/exceptions/user-not-logged';
import { prismaCourseProgressWritePort } from '@/repository/course-progress.prisma';
import { registerClassCurrentState, registerModuleFinishtState } from '@/services/courses';
import { clearAllMocks, setupMocks } from './setup';

jest.mock('@/auth');
jest.mock('@/exceptions/error-encoder');
jest.mock('@/repository/course-progress.prisma', () => ({
    prismaCourseProgressWritePort: {
        upsertClassProgress: jest.fn(), completeModule: jest.fn(), findQuizQuestion: jest.fn(),
        upsertQuizAnswer: jest.fn(), recordQuizAttempt: jest.fn(),
    },
}));

describe('Courses Service - User Progress', () => {
    beforeEach(() => setupMocks(logPrismaError as jest.Mock, auth as jest.Mock));
    afterEach(clearAllMocks);

    it('persiste el progreso de clase con un comando mínimo ligado al actor', async () => {
        await expect(registerClassCurrentState('course-123', 5, 120, false)).resolves.toEqual({ success: true });

        expect(prismaCourseProgressWritePort.upsertClassProgress).toHaveBeenCalledWith({
            userId: 'user-123', canonicalId: 'course-123', classId: 5,
            currentVideoTime: 120, completed: false,
        });
    });

    it('persiste la finalización del módulo con un comando mínimo ligado al actor', async () => {
        await expect(registerModuleFinishtState('course-123', 3)).resolves.toEqual({ success: true });

        expect(prismaCourseProgressWritePort.completeModule).toHaveBeenCalledWith({
            userId: 'user-123', canonicalId: 'course-123', moduleId: 3,
        });
    });

    it('no permite registrar progreso sin sesión autenticada', async () => {
        (auth as jest.Mock).mockResolvedValue(null);

        await expect(registerClassCurrentState('course-123', 5, 120, false)).rejects.toThrow(UserNotLoggedError);
        expect(prismaCourseProgressWritePort.upsertClassProgress).not.toHaveBeenCalled();
    });

    it('propaga una validación de matrícula o pertenencia del puerto', async () => {
        const error = new Error('Clase inválida para el curso');
        (prismaCourseProgressWritePort.upsertClassProgress as jest.Mock).mockRejectedValue(error);

        await expect(registerClassCurrentState('course-123', 999, 120, false)).rejects.toThrow(error);
        expect(logPrismaError).toHaveBeenCalledWith(error);
    });
});
