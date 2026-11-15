import { prisma } from '@/lib/prisma';
import { prismaCourseProgressWritePort } from '@/repository/course-progress.prisma';

const transactionClient = {
    userCourse: { findFirst: jest.fn() },
    moduleClass: { findFirst: jest.fn() },
    courseModules: { findFirst: jest.fn() },
    quizQuestion: { findFirst: jest.fn() },
    moduleQuiz: { findFirst: jest.fn() },
    userClassesState: { upsert: jest.fn() },
    userModuleState: { upsert: jest.fn() },
    userQuizAnswer: { findMany: jest.fn(), upsert: jest.fn() },
    userQuizState: { upsert: jest.fn(), findUnique: jest.fn() },
};

jest.mock('@/lib/prisma', () => ({
    prisma: {
        $transaction: jest.fn(),
        userCourse: { findFirst: jest.fn() },
        quizQuestion: { findFirst: jest.fn() },
    },
}));

const runTransaction = () => {
    (prisma.$transaction as jest.Mock).mockImplementation((callback) => callback(transactionClient));
};

const enrollment = (passedQuizIds: number[] = []) => ({
    id: 12,
    courseId: 8,
    course: { courseModules: [
        { id: 3, moduleQuiz: [{ id: 4 }] },
        { id: 6, moduleQuiz: [{ id: 7 }] },
    ] },
    userQuizState: passedQuizIds.map((quizId) => ({ quizId })),
});

describe('prismaCourseProgressWritePort', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        runTransaction();
        (transactionClient.userQuizState.findUnique as jest.Mock).mockResolvedValue(null);
    });

    it('valida matrícula y pertenencia de clase antes del upsert idempotente', async () => {
        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment());
        (transactionClient.moduleClass.findFirst as jest.Mock).mockResolvedValue({ id: 5, courseModuleId: 3 });

        await prismaCourseProgressWritePort.upsertClassProgress({
            userId: 'student-1', canonicalId: 'typescript', classId: 5,
            currentVideoTime: 120, completed: false,
        });

        expect(transactionClient.moduleClass.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                id: 5,
                courseModule: { is: { courseId: 8, deleted: false } },
            }),
        }));
        expect(transactionClient.userClassesState.upsert).toHaveBeenCalledWith({
            where: { userCourseId_classId: { userCourseId: 12, classId: 5 } },
            create: { userCourseId: 12, classId: 5, currentVideoTime: 120, completed: false },
            update: { currentVideoTime: 120 },
        });
    });

    it('acepta solicitudes repetidas de progreso sin crear filas duplicadas', async () => {
        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment());
        (transactionClient.moduleClass.findFirst as jest.Mock).mockResolvedValue({ id: 5, courseModuleId: 3 });
        const command = {
            userId: 'student-1', canonicalId: 'typescript', classId: 5,
            currentVideoTime: 120, completed: true,
        };

        await Promise.all([
            prismaCourseProgressWritePort.upsertClassProgress(command),
            prismaCourseProgressWritePort.upsertClassProgress(command),
        ]);

        expect(transactionClient.userClassesState.upsert).toHaveBeenCalledTimes(2);
        expect(transactionClient.userClassesState.upsert).toHaveBeenLastCalledWith(expect.objectContaining({
            where: { userCourseId_classId: { userCourseId: 12, classId: 5 } },
        }));
    });

    it('rechaza progreso cuando no existe matrícula y no escribe estado', async () => {
        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(prismaCourseProgressWritePort.completeModule({
            userId: 'student-1', canonicalId: 'typescript', moduleId: 3,
        })).rejects.toThrow('El curso no le pertenece al usuario');
        expect(transactionClient.courseModules.findFirst).not.toHaveBeenCalled();
        expect(transactionClient.userModuleState.upsert).not.toHaveBeenCalled();
    });

    it('rechaza una respuesta si pregunta, quiz o módulo no pertenecen al curso', async () => {
        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment());
        (transactionClient.quizQuestion.findFirst as jest.Mock).mockResolvedValue(null);

        await expect(prismaCourseProgressWritePort.upsertQuizAnswer(
            { userId: 'student-1', canonicalId: 'typescript', moduleId: 3, quizId: 4, questionId: 5 },
            { answer: 'A', correct: 'A', isCorrect: true, points: 10 },
        )).rejects.toThrow('Pregunta inválida para el quiz');
        expect(transactionClient.userQuizAnswer.upsert).not.toHaveBeenCalled();
    });

    it('califica texto con la columna, incluso si aún existe una opción histórica', async () => {
        (prisma.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment());
        (prisma.quizQuestion.findFirst as jest.Mock).mockResolvedValue({
            id: 5, type: 'text', points: 10, expectedAnswer: 'Nueva respuesta',
            possibleAnswerQuestion: [{ id: 6, value: 'Respuesta antigua', isCorrect: true }],
        });

        await expect(prismaCourseProgressWritePort.findQuizQuestion({
            userId: 'student-1', canonicalId: 'typescript', moduleId: 3, quizId: 4, questionId: 5,
        })).resolves.toEqual({ id: 5, type: 'text', points: 10, expectedAnswer: 'Nueva respuesta' });
        expect(prisma.quizQuestion.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            select: expect.objectContaining({ expectedAnswer: true, possibleAnswerQuestion: expect.objectContaining({
                where: { deletedAt: null },
            }) }),
        }));
    });

    it('lee texto legacy sin columna poblada y rechaza una solución inválida', async () => {
        (prisma.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment());
        const scope = { userId: 'student-1', canonicalId: 'typescript', moduleId: 3, quizId: 4, questionId: 5 };
        (prisma.quizQuestion.findFirst as jest.Mock).mockResolvedValueOnce({
            id: 5, type: 'text', points: 10, expectedAnswer: null,
            possibleAnswerQuestion: [{ id: 6, value: 'Histórica', isCorrect: true }],
        }).mockResolvedValueOnce({
            id: 5, type: 'text', points: 10, expectedAnswer: ' ',
            possibleAnswerQuestion: [{ id: 6, value: 'Histórica', isCorrect: true }],
        });
        await expect(prismaCourseProgressWritePort.findQuizQuestion(scope)).resolves.toEqual({
            id: 5, type: 'text', points: 10, expectedAnswer: 'Histórica',
        });
        await expect(prismaCourseProgressWritePort.findQuizQuestion(scope)).rejects.toThrow('respuesta esperada válida');
    });

    it('guarda el resultado del quiz con un único estado y reintento atómico', async () => {
        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment());
        (transactionClient.moduleQuiz.findFirst as jest.Mock).mockResolvedValue({
            id: 4,
            courseModuleId: 3,
            courseModule: { minRequiredPoints: 15 },
            quizQuestion: [{ id: 1 }, { id: 2 }],
        });
        (transactionClient.userQuizAnswer.findMany as jest.Mock).mockResolvedValue([
            { questionId: 1, points: 10 }, { questionId: 2, points: 10 },
        ]);

        const result = await prismaCourseProgressWritePort.recordQuizAttempt(
            { userId: 'student-1', canonicalId: 'typescript', moduleId: 3, quizId: 4 },
            ({ questionCount, minRequiredPoints, answers }) => {
                const totalScore = answers.reduce((total, answer) => total + answer.points, 0);
                return { questionCount, totalScore, pass: totalScore >= minRequiredPoints };
            },
        );

        expect(result).toEqual({ questionCount: 2, totalScore: 20, pass: true });
        expect(transactionClient.userQuizState.upsert).toHaveBeenCalledWith({
            where: { userCourseId_quizId: { userCourseId: 12, quizId: 4 } },
            create: {
                userCourseId: 12, courseModuleId: 3, quizId: 4,
                retries: 1, result: 20, passed: true,
            },
            update: {
                retries: { increment: 1 }, result: 20, passed: true, courseModuleId: 3,
            },
        });
    });

    it('rechaza clases y respuestas de módulos futuros antes de guardar progreso', async () => {
        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment());
        (transactionClient.moduleClass.findFirst as jest.Mock).mockResolvedValue({ id: 9, courseModuleId: 6 });

        await expect(prismaCourseProgressWritePort.upsertClassProgress({
            userId: 'student-1', canonicalId: 'typescript', classId: 9, currentVideoTime: 10, completed: true,
        })).rejects.toMatchObject({ cause: 'Debes aprobar el quiz del módulo anterior para continuar' });
        expect(transactionClient.userClassesState.upsert).not.toHaveBeenCalled();

        (transactionClient.quizQuestion.findFirst as jest.Mock).mockResolvedValue({
            id: 10, type: 'text', points: 1, expectedAnswer: 'Sí', possibleAnswerQuestion: [],
        });
        await expect(prismaCourseProgressWritePort.upsertQuizAnswer(
            { userId: 'student-1', canonicalId: 'typescript', moduleId: 6, quizId: 7, questionId: 10 },
            { answer: 'Sí', correct: 'Sí', isCorrect: true, points: 1 },
        )).rejects.toMatchObject({ cause: 'Debes aprobar el quiz del módulo anterior para continuar' });
        expect(transactionClient.userQuizAnswer.upsert).not.toHaveBeenCalled();
    });

    it('exige quiz aprobado para completar el módulo y desbloquea el siguiente', async () => {
        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment());
        (transactionClient.courseModules.findFirst as jest.Mock).mockResolvedValue({ id: 3 });

        await expect(prismaCourseProgressWritePort.completeModule({
            userId: 'student-1', canonicalId: 'typescript', moduleId: 3,
        })).rejects.toMatchObject({ cause: 'Debes aprobar el quiz para completar el módulo' });
        expect(transactionClient.userModuleState.upsert).not.toHaveBeenCalled();

        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment([4]));
        await prismaCourseProgressWritePort.completeModule({ userId: 'student-1', canonicalId: 'typescript', moduleId: 3 });
        (transactionClient.moduleClass.findFirst as jest.Mock).mockResolvedValue({ id: 9, courseModuleId: 6 });
        await prismaCourseProgressWritePort.upsertClassProgress({
            userId: 'student-1', canonicalId: 'typescript', classId: 9, currentVideoTime: 0, completed: false,
        });
        expect(transactionClient.userModuleState.upsert).toHaveBeenCalledTimes(1);
        expect(transactionClient.userClassesState.upsert).toHaveBeenCalledTimes(1);
    });

    it('impide calcular el quiz de un módulo futuro mediante una llamada directa', async () => {
        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment());
        (transactionClient.moduleQuiz.findFirst as jest.Mock).mockResolvedValue({
            id: 7, courseModuleId: 6, courseModule: { minRequiredPoints: 5 }, quizQuestion: [{ id: 10 }],
        });

        await expect(prismaCourseProgressWritePort.recordQuizAttempt(
            { userId: 'student-1', canonicalId: 'typescript', moduleId: 6, quizId: 7 },
            () => ({ questionCount: 1, totalScore: 10, pass: true }),
        )).rejects.toMatchObject({ cause: 'Debes aprobar el quiz del módulo anterior para continuar' });
        expect(transactionClient.userQuizAnswer.findMany).not.toHaveBeenCalled();
        expect(transactionClient.userQuizState.upsert).not.toHaveBeenCalled();
    });

    it('conserva el aprobado en un reintento posterior fallido', async () => {
        (transactionClient.userCourse.findFirst as jest.Mock).mockResolvedValue(enrollment([4]));
        (transactionClient.moduleQuiz.findFirst as jest.Mock).mockResolvedValue({
            id: 4, courseModuleId: 3, courseModule: { minRequiredPoints: 5 }, quizQuestion: [{ id: 1 }],
        });
        (transactionClient.userQuizAnswer.findMany as jest.Mock).mockResolvedValue([{ questionId: 1, points: 0 }]);
        (transactionClient.userQuizState.findUnique as jest.Mock).mockResolvedValue({ passed: true, result: 10 });

        const result = await prismaCourseProgressWritePort.recordQuizAttempt(
            { userId: 'student-1', canonicalId: 'typescript', moduleId: 3, quizId: 4 },
            () => ({ questionCount: 1, totalScore: 0, pass: false }),
        );
        expect(result.pass).toBe(false);
        expect(transactionClient.userQuizState.upsert).toHaveBeenCalledWith(expect.objectContaining({
            update: expect.objectContaining({ passed: true, result: 10 }),
        }));
    });
});
