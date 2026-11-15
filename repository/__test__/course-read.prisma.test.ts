import {
    prismaCourseCatalogReadPort,
    prismaCourseEditorReadPort,
    prismaStudentCourseReadPort,
    prismaStudentQuizReadPort,
} from '@/repository/course-read.prisma';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    prisma: {
        course: { findMany: jest.fn(), findFirst: jest.fn(), count: jest.fn() },
        userCourse: { findFirst: jest.fn() },
        userQuizAnswer: { findMany: jest.fn() },
        userQuizState: { findFirst: jest.fn() },
    },
}));

const course = {
    id: 7,
    canonicalId: 'typescript',
    title: 'TypeScript',
    description: 'Curso',
    price: 120,
    courseImage: 'https://example.com/course.png',
    instructorName: 'Ada',
    instructorPhoto: 'https://example.com/ada.png',
    expiresAt: new Date('2030-01-01T00:00:00.000Z'),
    category: { id: 2, name: 'Programación' },
    courseModules: [{
        id: 11,
        courseId: 7,
        title: 'Fundamentos',
        minRequiredPoints: 5,
        moduleClass: [{
            id: 12,
            courseModuleId: 11,
            title: 'Introducción',
            description: 'Clase',
            videoPath: 'https://example.com/video.mp4',
            videoSize: 50,
            videoDuration: 65,
        }],
        moduleQuiz: [{
            id: 13,
            courseModuleId: 11,
            title: 'Quiz',
            description: 'Evaluación',
            quizQuestion: [{
                id: 14,
                type: 'multiple',
                title: 'Pregunta',
                points: 10,
                possibleAnswerQuestion: [{ id: 15, value: 'Correcta', isCorrect: true }, { id: 18, value: 'Incorrecta', isCorrect: false }],
            }, {
                id: 16,
                type: 'text',
                title: 'Pregunta abierta',
                points: 10,
                expectedAnswer: 'Respuesta secreta',
                possibleAnswerQuestion: [{ id: 17, value: 'Respuesta secreta', isCorrect: true }],
            }],
        }],
    }],
};

describe('Prisma course-read ports', () => {
    beforeEach(() => jest.clearAllMocks());

    it('maps catalog rows without exposing persistence classes', async () => {
        (prisma.course.findMany as jest.Mock).mockResolvedValue([{ ...course, userCourse: [] }]);

        await expect(prismaCourseCatalogReadPort.findActiveCatalogCourses()).resolves.toEqual([
            expect.objectContaining({ id: 7, canonicalId: 'typescript', alreadyPurchased: false, courseDuration: '00:01:05' }),
        ]);
    });

    it('returns null as the normal result when an editor course is absent', async () => {
        (prisma.course.findFirst as jest.Mock).mockResolvedValue(null);
        await expect(prismaCourseEditorReadPort.findEditorCourseById(999)).resolves.toBeNull();
    });

    it('returns null when a student is not enrolled', async () => {
        (prisma.userCourse.findFirst as jest.Mock).mockResolvedValue(null);
        await expect(prismaStudentCourseReadPort.findEnrolledCourse('typescript', 'student-1')).resolves.toBeNull();
    });

    it('removes quiz solutions from the student projection', async () => {
        (prisma.userCourse.findFirst as jest.Mock).mockResolvedValue({
            course,
            userModuleState: [],
            userClassesState: [],
            userQuizState: [],
        });

        const result = await prismaStudentCourseReadPort.findEnrolledCourse('typescript', 'student-1');
        expect(result).not.toBeNull();
        expect(JSON.stringify(result)).not.toContain('isCorrect');
        expect(JSON.stringify(result)).not.toContain('"points"');
        expect(JSON.stringify(result)).not.toContain('Respuesta secreta');
        expect(result?.modules[0]?.quiz?.questions[0]).toEqual({ id: 14, type: 'multiple', title: 'Pregunta', options: [{ id: 15, value: 'Correcta' }, { id: 18, value: 'Incorrecta' }] });
        expect(result?.modules[0]?.quiz?.questions[1]).toEqual({ id: 16, type: 'text', title: 'Pregunta abierta' });
        expect(prisma.userCourse.findFirst).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                userId: 'student-1',
                course: { canonicalId: 'typescript', deleted: false },
            },
        }));
        const query = (prisma.userCourse.findFirst as jest.Mock).mock.calls[0][0];
        const questionSelect = query.include.course.include.courseModules.select.moduleQuiz.select.quizQuestion.select;
        expect(questionSelect).not.toHaveProperty('points');
        expect(questionSelect.possibleAnswerQuestion.select).not.toHaveProperty('isCorrect');
    });

    it('returns the saved class time and latest activity for course resumption', async () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        const updatedAt = new Date('2026-01-02T00:00:00.000Z');
        (prisma.userCourse.findFirst as jest.Mock).mockResolvedValue({
            course,
            userModuleState: [], userQuizState: [],
            userClassesState: [
                { classId: 12, currentVideoTime: 42, completed: false, createdAt, updatedAt },
            ],
        });

        const result = await prismaStudentCourseReadPort.findEnrolledCourse('typescript', 'student-1');
        expect(result?.classCompleted).toEqual([{
            classId: 12, currentVideoTime: 42, isCompleted: false,
            createdAt: createdAt.toISOString(), lastViewedAt: updatedAt.toISOString(),
        }]);
        expect((prisma.userCourse.findFirst as jest.Mock).mock.calls[0][0].include.userClassesState.select.updatedAt).toBe(true);
    });

    it('returns the quiz attempt time used to distinguish revisits from older progress', async () => {
        const createdAt = new Date('2026-01-01T00:00:00.000Z');
        const updatedAt = new Date('2026-01-03T00:00:00.000Z');
        (prisma.userCourse.findFirst as jest.Mock).mockResolvedValue({
            course, userModuleState: [], userClassesState: [],
            userQuizState: [{ quizId: 13, courseModuleId: 11, result: 10, retries: 2,
                passed: true, createdAt, updatedAt }],
        });

        const result = await prismaStudentCourseReadPort.findEnrolledCourse('typescript', 'student-1');
        expect(result?.quizCompleted[0]).toMatchObject({
            quizId: 13, createdAt: createdAt.toISOString(), lastAttemptAt: updatedAt.toISOString(),
        });
        expect((prisma.userCourse.findFirst as jest.Mock).mock.calls[0][0].include.userQuizState.select.updatedAt).toBe(true);
    });

    it('hides future lessons, video URLs and quiz questions until the preceding quiz is passed', async () => {
        const futureModule = {
            ...course.courseModules[0], id: 21, title: 'Avanzado',
            moduleClass: [{ ...course.courseModules[0].moduleClass[0], id: 22, courseModuleId: 21, videoPath: 'https://example.com/private-video.mp4' }],
            moduleQuiz: [{ ...course.courseModules[0].moduleQuiz[0], id: 23, courseModuleId: 21 }],
        };
        const enrollment = {
            course: { ...course, courseModules: [course.courseModules[0], futureModule] },
            userModuleState: [], userClassesState: [], userQuizState: [],
        };
        (prisma.userCourse.findFirst as jest.Mock).mockResolvedValueOnce(enrollment)
            .mockResolvedValueOnce({ ...enrollment, userQuizState: [{ quizId: 13, courseModuleId: 11, result: 10, retries: 1, passed: true, createdAt: new Date() }] });

        const locked = await prismaStudentCourseReadPort.findEnrolledCourse('typescript', 'student-1');
        expect(locked?.modules[0].locked).toBe(false);
        expect(locked?.modules[1]).toMatchObject({ id: 21, locked: true, classes: [], quiz: null });
        expect(JSON.stringify(locked)).not.toContain('private-video.mp4');

        const unlocked = await prismaStudentCourseReadPort.findEnrolledCourse('typescript', 'student-1');
        expect(unlocked?.modules[1].locked).toBe(false);
        expect(unlocked?.modules[1].classes[0].video).toBe('https://example.com/private-video.mp4');
    });

    it('exposes a single expected answer to the author without fake text options', async () => {
        (prisma.course.findFirst as jest.Mock).mockResolvedValue(course);

        const result = await prismaCourseEditorReadPort.findEditorCourseById(7);
        expect(result?.modules[0]?.quiz?.questions).toEqual([
            { id: 14, type: 'multiple', title: 'Pregunta', points: 10, options: [
                { id: 15, value: 'Correcta', isCorrect: true },
                { id: 18, value: 'Incorrecta', isCorrect: false },
            ] },
            { id: 16, type: 'text', title: 'Pregunta abierta', points: 10, expectedAnswer: { value: 'Respuesta secreta' } },
        ]);
        const query = (prisma.course.findFirst as jest.Mock).mock.calls[0][0];
        expect(query.include.courseModules.orderBy).toEqual([{ position: 'asc' }, { id: 'asc' }]);
        expect(query.include.courseModules.include.moduleClass.orderBy).toEqual([{ position: 'asc' }, { id: 'asc' }]);
    });

    it('reads a new text question without options and an unmigrated historical question', async () => {
        const columnOnly = structuredClone(course);
        columnOnly.courseModules[0].moduleQuiz[0].quizQuestion[1].possibleAnswerQuestion = [];
        (prisma.course.findFirst as jest.Mock).mockResolvedValueOnce(columnOnly);
        const fresh = await prismaCourseEditorReadPort.findEditorCourseById(7);
        expect(fresh?.modules[0].quiz?.questions[1]).toMatchObject({
            type: 'text', expectedAnswer: { value: 'Respuesta secreta' },
        });

        const historical = structuredClone(course);
        Object.assign(historical.courseModules[0].moduleQuiz[0].quizQuestion[1], { expectedAnswer: null });
        (prisma.course.findFirst as jest.Mock).mockResolvedValueOnce(historical);
        const legacy = await prismaCourseEditorReadPort.findEditorCourseById(7);
        expect(legacy?.modules[0].quiz?.questions[1]).toMatchObject({
            type: 'text', expectedAnswer: { value: 'Respuesta secreta' },
        });
        const query = (prisma.course.findFirst as jest.Mock).mock.calls[0][0];
        const options = query.include.courseModules.include.moduleQuiz.include.quizQuestion.include.possibleAnswerQuestion;
        expect(options.where).toEqual({ deletedAt: null });
    });

    it('reads answers and the last attempt through a student enrollment scope', async () => {
        (prisma.userQuizAnswer.findMany as jest.Mock).mockResolvedValue([{ questionId: 14, answer: 'Respuesta' }]);
        (prisma.userQuizState.findFirst as jest.Mock).mockResolvedValue({
            quizId: 13, courseModuleId: 11, retries: 1, result: 10, passed: true,
        });

        await expect(prismaStudentQuizReadPort.findAnswers('typescript', 'student-1', 13))
            .resolves.toEqual([{ questionId: 14, answer: 'Respuesta' }]);
        await expect(prismaStudentQuizReadPort.findLatestAttempt('typescript', 'student-1', 13))
            .resolves.toEqual({ quizId: 13, courseModuleId: 11, retries: 1, result: 10, passed: true });

        const answerQuery = (prisma.userQuizAnswer.findMany as jest.Mock).mock.calls[0][0];
        expect(answerQuery).toMatchObject({
            where: {
                quizId: 13,
                userCourse: { is: { userId: 'student-1', course: { canonicalId: 'typescript', deleted: false } } },
            },
            select: { questionId: true, answer: true },
        });
        const attemptQuery = (prisma.userQuizState.findFirst as jest.Mock).mock.calls[0][0];
        expect(attemptQuery).toMatchObject({
            where: {
                quizId: 13,
                userCourse: { is: { userId: 'student-1', course: { canonicalId: 'typescript', deleted: false } } },
            },
            select: { quizId: true, courseModuleId: true, retries: true, result: true, passed: true },
        });
    });
});
