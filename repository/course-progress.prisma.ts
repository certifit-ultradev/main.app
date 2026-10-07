import type { CourseProgressWritePort } from '@/application/courses/course-progress.ports';
import type {
    ClassProgressUpsert,
    ModuleCompletion,
    QuizAnswerScope,
    QuizAttemptContext,
    QuizAttemptResult,
    QuizQuestionForScoring,
    QuizScope,
    StoredQuizAnswer,
} from '@/application/courses/progress.commands';
import { prisma } from '@/lib/prisma';
import { resolveTextAnswer } from '@/mappers/course-text-answer';

type CourseProgressQueryClient = Pick<
    typeof prisma,
    'userCourse' | 'moduleClass' | 'courseModules' | 'quizQuestion' | 'moduleQuiz' |
    'userClassesState' | 'userModuleState' | 'userQuizAnswer' | 'userQuizState'
>;

const scopedEnrollment = (userId: string, canonicalId: string) => ({
    userId,
    course: {
        canonicalId,
        deleted: false,
    },
});

const scopedModule = (courseId: number, moduleId: number) => ({
    id: moduleId,
    courseId,
    deleted: false,
});

const scopedQuiz = (courseId: number, moduleId: number, quizId: number) => ({
    id: quizId,
    deleted: false,
    courseModule: {
        is: scopedModule(courseId, moduleId),
    },
});

const findEnrollment = (client: CourseProgressQueryClient, userId: string, canonicalId: string) =>
    client.userCourse.findFirst({
        where: scopedEnrollment(userId, canonicalId),
        select: { id: true, courseId: true },
    });

const getQuizQuestion = async (client: CourseProgressQueryClient, scope: QuizAnswerScope): Promise<QuizQuestionForScoring | null> => {
    const enrollment = await findEnrollment(client, scope.userId, scope.canonicalId);
    if (!enrollment) {
        return null;
    }

    const question = await client.quizQuestion.findFirst({
        where: {
            id: scope.questionId,
            deleted: false,
            moduleQuiz: {
                is: scopedQuiz(enrollment.courseId, scope.moduleId, scope.quizId),
            },
        },
        select: {
            id: true,
            type: true,
            points: true,
            expectedAnswer: true,
            possibleAnswerQuestion: {
                where: { deletedAt: null },
                select: { id: true, value: true, isCorrect: true },
            },
        },
    });

    if (!question || (question.type !== 'text' && question.type !== 'multiple')) {
        return null;
    }

    const options = question.possibleAnswerQuestion;
    if (question.type === 'text') {
        const expectedAnswer = resolveTextAnswer(question.expectedAnswer, options);
        if (expectedAnswer === null) {
            throw new Error('La pregunta de texto no tiene una respuesta esperada válida');
        }
        return { id: question.id, type: 'text', points: question.points, expectedAnswer };
    }
    if (options.length < 2 || options.filter((option) => option.isCorrect).length !== 1) {
        throw new Error('La pregunta de selección no tiene opciones válidas');
    }
    return { id: question.id, type: 'multiple', points: question.points, options };
};

const requireEnrollment = <T>(value: T | null): T => {
    if (!value) {
        throw new Error('El curso no le pertenece al usuario');
    }
    return value;
};

const requireScope = <T>(value: T | null, message: string): T => {
    if (!value) {
        throw new Error(message);
    }
    return value;
};

const upsertClassProgress = async (command: ClassProgressUpsert): Promise<void> => {
    await prisma.$transaction(async (tx) => {
        const enrollment = requireEnrollment(await findEnrollment(tx, command.userId, command.canonicalId));
        const lesson = requireScope(await tx.moduleClass.findFirst({
            where: {
                id: command.classId,
                deleted: false,
                courseModule: { is: { courseId: enrollment.courseId, deleted: false } },
            },
            select: { id: true },
        }), 'Clase inválida para el curso');

        await tx.userClassesState.upsert({
            where: {
                userCourseId_classId: {
                    userCourseId: enrollment.id,
                    classId: lesson.id,
                },
            },
            create: {
                userCourseId: enrollment.id,
                classId: lesson.id,
                currentVideoTime: command.currentVideoTime,
                completed: command.completed,
            },
            update: {
                currentVideoTime: command.currentVideoTime,
                ...(command.completed ? { completed: true } : {}),
            },
        });
    });
};

const completeModule = async (command: ModuleCompletion): Promise<void> => {
    await prisma.$transaction(async (tx) => {
        const enrollment = requireEnrollment(await findEnrollment(tx, command.userId, command.canonicalId));
        const courseModule = requireScope(await tx.courseModules.findFirst({
            where: scopedModule(enrollment.courseId, command.moduleId),
            select: { id: true },
        }), 'Módulo inválido para el curso');

        await tx.userModuleState.upsert({
            where: {
                userCourseId_moduleId: {
                    userCourseId: enrollment.id,
                    moduleId: courseModule.id,
                },
            },
            create: { userCourseId: enrollment.id, moduleId: courseModule.id, completed: true },
            update: { completed: true },
        });
    });
};

const findQuizQuestion = (scope: QuizAnswerScope) => getQuizQuestion(prisma, scope);

const upsertQuizAnswer = async (scope: QuizAnswerScope, answer: StoredQuizAnswer): Promise<void> => {
    await prisma.$transaction(async (tx) => {
        const question = requireScope(await getQuizQuestion(tx, scope), 'Pregunta inválida para el quiz');
        const enrollment = requireEnrollment(await findEnrollment(tx, scope.userId, scope.canonicalId));

        await tx.userQuizAnswer.upsert({
            where: {
                userCourseId_quizId_questionId: {
                    userCourseId: enrollment.id,
                    quizId: scope.quizId,
                    questionId: question.id,
                },
            },
            create: {
                userCourseId: enrollment.id,
                quizId: scope.quizId,
                questionId: question.id,
                ...answer,
            },
            update: answer,
        });
    });
};

const recordQuizAttempt = async (
    scope: QuizScope,
    calculateResult: (context: QuizAttemptContext) => QuizAttemptResult,
): Promise<QuizAttemptResult> => prisma.$transaction(async (tx) => {
    const enrollment = requireEnrollment(await findEnrollment(tx, scope.userId, scope.canonicalId));
    const quiz = requireScope(await tx.moduleQuiz.findFirst({
        where: scopedQuiz(enrollment.courseId, scope.moduleId, scope.quizId),
        select: {
            id: true,
            courseModuleId: true,
            courseModule: { select: { minRequiredPoints: true } },
            quizQuestion: {
                where: { deleted: false },
                select: { id: true },
            },
        },
    }), 'Quiz inválido para el módulo');

    const answers = await tx.userQuizAnswer.findMany({
        where: { userCourseId: enrollment.id, quizId: quiz.id },
        select: { questionId: true, points: true },
    });
    if (answers.length === 0) {
        throw new Error(`El quiz ${scope.quizId} del módulo no tiene respuesta`);
    }

    const result = calculateResult({
        questionCount: quiz.quizQuestion.length,
        minRequiredPoints: quiz.courseModule.minRequiredPoints,
        answers,
    });

    await tx.userQuizState.upsert({
        where: {
            userCourseId_quizId: {
                userCourseId: enrollment.id,
                quizId: quiz.id,
            },
        },
        create: {
            userCourseId: enrollment.id,
            courseModuleId: quiz.courseModuleId,
            quizId: quiz.id,
            retries: 1,
            result: result.totalScore,
            passed: result.pass,
        },
        update: {
            retries: { increment: 1 },
            result: result.totalScore,
            passed: result.pass,
            courseModuleId: quiz.courseModuleId,
        },
    });

    return result;
});

export const prismaCourseProgressWritePort: CourseProgressWritePort = {
    upsertClassProgress,
    completeModule,
    findQuizQuestion,
    upsertQuizAnswer,
    recordQuizAttempt,
};
