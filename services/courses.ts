import { CalculateQuizScoreCommand, SubmitQuizAnswerCommand, type ResultQuizScore } from '@/application/courses/quiz.commands';
import { CatalogCourseCardDto } from '@/application/courses/course.dto';
import { withAuthenticatedActor as withAuth, getOptionalAuthenticatedActorId as getOptionalUserId } from '@/infrastructure/auth/authenticated-actor';
import { logPrismaError } from "@/exceptions/error-encoder";
import { executeService } from "@/utils/service-wrapper";
import type { CourseEditorDto } from '@/application/courses/course.dto';
import type { CourseEditorPageDto, StudentQuizAnswerDto, StudentQuizAttemptDto } from '@/application/courses/course-read.ports';
import type { StudentCourseDto } from '@/application/courses/student-course.dto';
import type { StudentCourseListItemDto } from '@/application/courses/student-course.dto';
import {
    prismaCourseCatalogReadPort,
    prismaCourseEditorReadPort,
    prismaStudentCourseReadPort,
    prismaStudentQuizReadPort,
} from '@/repository/course-read.prisma';
import { prismaCourseProgressWritePort } from '@/repository/course-progress.prisma';
import { prismaCourseEditorWritePort } from '@/repository/course-editor.prisma';
import type { QuizAnswerScope, QuizAttemptContext, QuizAttemptResult, QuizQuestionForScoring, StoredQuizAnswer } from '@/application/courses/progress.commands';
import type { CourseEditorPatch, CreateCourseCommand } from '@/application/courses/course-editor.commands';
import { assertValidCourseQuestion } from '@/application/courses/course-question.validation';
import type { CourseSalesDto, MonthlyCountDto } from '@/application/courses/course-analytics.ports';
import { prismaCourseAnalyticsReadPort } from '@/repository/course-analytics.prisma';

export const COURSES_PAGE_SIZE = 10;

/** Catalog projection for the optional current viewer. */
export const getCatalogCourses = async (): Promise<CatalogCourseCardDto[]> => {
    const viewerId = await getOptionalUserId();
    return executeService(() => prismaCourseCatalogReadPort.findActiveCatalogCourses(viewerId ?? undefined));
};

/** Student-only projection; a missing enrollment is an ordinary null result. */
export const getStudentCourseByCanonicalId = withAuth(async (user, canonicalId: string): Promise<StudentCourseDto | null> => {
    return executeService(() => prismaStudentCourseReadPort.findEnrolledCourse(canonicalId, user.id));
});

/** Editor projection. It never exposes a persistence model to its caller. */
export const getEditorCourseById = async (id: number): Promise<CourseEditorDto | null> => {
    return executeService(() => prismaCourseEditorReadPort.findEditorCourseById(id));
};

export const getEditorCoursePage = async (request: { page: number }): Promise<CourseEditorPageDto> => {
    return executeService(() => prismaCourseEditorReadPort.findEditorCoursePage(request.page, COURSES_PAGE_SIZE));
};

/**
 * 
 * @param canonicalId 
 * @param quizId 
 * @returns 
 */
export const getUserCourseQuizAnswers = withAuth(async (user, canonicalId: string, quizId: number): Promise<StudentQuizAnswerDto[]> => {
    return executeService(() => prismaStudentQuizReadPort.findAnswers(canonicalId, user.id, quizId));
});

/** Compact enrollment list for the authenticated student; persistence entities never cross this boundary. */
export const getUserCourses = withAuth(async (user): Promise<StudentCourseListItemDto[]> => {
    try {
        return await prismaStudentCourseReadPort.findEnrolledCourses(user.id);
    } catch (error) {
        logPrismaError(error);
        return [];
    }
})

/**
 * 
 * @param course 
 * @returns 
 */
/** Creates a course and returns the serializable author projection used by actions. */
export const registerCourse = async (command: CreateCourseCommand): Promise<CourseEditorDto> => {
    try {
        for (const module of command.modules) {
            for (const question of module.quiz.questions) assertValidCourseQuestion(question);
        }
        const courseId = await prismaCourseEditorWritePort.createCourse(command);
        const course = await prismaCourseEditorReadPort.findEditorCourseById(courseId);
        if (!course) throw new Error('No fue posible leer el curso creado');
        return course;
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param courseId 
 * @param course 
 * @returns 
 */
export const editCourse = async (courseId: number, patch: CourseEditorPatch) => {
    try {
        for (const module of patch.modules) {
            for (const question of module.quiz.questions) assertValidCourseQuestion(question);
        }
        await prismaCourseEditorWritePort.updateCourse(courseId, patch);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param courseId 
 * @param videoPath 
 * @param videoSize 
 * @returns 
 */
export const updateClassVideoPath = async (clsId: number, videoPath: string, videoSize: number) => {
    try {
        return await prismaCourseEditorWritePort.setClassVideo(clsId, videoPath, videoSize);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param id 
 * @returns 
 */
export const activateCourse = async (id: number) => {
    try {
        const countActiveCourses = await prismaCourseEditorReadPort.countActiveCourses();
        if (countActiveCourses === 3) {
            return { success: false, message: "Solo se pueden tener 3 cursos activos" };
        }

        const updateResult = await prismaCourseEditorWritePort.setCourseActive(id, true);
        if (!updateResult) {
            return { success: false, message: "No se pudo activar el curso" };
        }

        return { success: true, message: "Curso activado correctamente" };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

/**
 * 
 * @param id 
 * @returns 
 */
export const deactivateCourse = async (id: number) => {
    try {
        const updateResult = await prismaCourseEditorWritePort.setCourseActive(id, false);
        if (!updateResult) {
            return { success: false, message: "No se pudo desactivar el curso" };
        }

        return { success: true, message: "Curso desactivado" };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}

const scoreQuizAnswer = (
    question: QuizQuestionForScoring,
    command: SubmitQuizAnswerCommand,
): StoredQuizAnswer => {
    if (question.type === 'text') {
        if (command.kind !== 'text') {
            throw new Error('El tipo de respuesta no coincide con la pregunta');
        }

        const isCorrect = question.expectedAnswer.trim() === command.answer.trim();
        return {
            answer: command.answer,
            correct: question.expectedAnswer,
            isCorrect,
            points: isCorrect ? question.points : 0,
        };
    }

    if (command.kind !== 'multiple_choice') {
        throw new Error('El tipo de respuesta no coincide con la pregunta');
    }

    const correctOption = question.options.find((option) => option.isCorrect);
    if (!correctOption) {
        throw new Error('La pregunta no tiene una respuesta correcta configurada');
    }

    const selectedOption = question.options.find((option) => option.id === command.optionId);
    if (!selectedOption) {
        throw new Error('Opción inválida para la pregunta');
    }

    return {
        answer: selectedOption.value,
        correct: correctOption.value,
        isCorrect: selectedOption.isCorrect,
        points: selectedOption.isCorrect ? question.points : 0,
    };
};

const calculateQuizAttemptResult = (context: QuizAttemptContext): QuizAttemptResult => {
    const totalScore = context.answers.reduce((total, answer) => total + answer.points, 0);
    return {
        questionCount: context.questionCount,
        totalScore,
        pass: totalScore >= context.minRequiredPoints,
    };
};

/**
 * 
 * @param courseId 
 * @param classId 
 * @param currentVideoTime 
 * @param isCompleted 
 * @returns 
 */
export const registerClassCurrentState = withAuth(async (user, courseId: string, classId: number, currentVideoTime: number, isCompleted: boolean) => {
    try {
        await prismaCourseProgressWritePort.upsertClassProgress({
            userId: user.id,
            canonicalId: courseId,
            classId,
            currentVideoTime,
            completed: isCompleted
        });

        return { success: true };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
})

/**
 * 
 * @param courseId 
 * @param moduleId 
 * @returns 
 */
export const registerModuleFinishtState = withAuth(async (user, courseId: string, moduleId: number) => {
    try {
        await prismaCourseProgressWritePort.completeModule({
            userId: user.id,
            canonicalId: courseId,
            moduleId
        });

        return { success: true };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
})

/**
 * 
 * @param data 
 * @returns 
 */
export const registerQuestionAnswer = withAuth(async (user, data: SubmitQuizAnswerCommand) => {
    try {
        const scope: QuizAnswerScope = {
            userId: user.id,
            canonicalId: data.canonicalId,
            moduleId: data.moduleId,
            quizId: data.quizId,
            questionId: data.questionId,
        };
        const question = await prismaCourseProgressWritePort.findQuizQuestion(scope);
        if (!question) {
            throw new Error("Pregunta inválida para el quiz");
        }

        await prismaCourseProgressWritePort.upsertQuizAnswer(scope, scoreQuizAnswer(question, data));

        return { success: true };
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
})

/**
 * 
 * @param data 
 * @returns 
 */
export const calculateQuizScore = withAuth(async (user, data: CalculateQuizScoreCommand): Promise<ResultQuizScore | null> => {
    try {
        return await prismaCourseProgressWritePort.recordQuizAttempt({
            userId: user.id,
            canonicalId: data.canonicalId,
            moduleId: data.moduleId,
            quizId: data.quizId,
        }, calculateQuizAttemptResult);
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
})

/**
 * 
 * @param canonicalId 
 * @param quizId 
 * @returns 
 */
export const getUserQuizState = withAuth(async (user, canonicalId: string, quizId: number): Promise<StudentQuizAttemptDto | null> => {
    return executeService(() => prismaStudentQuizReadPort.findLatestAttempt(canonicalId, user.id, quizId));
});

/**
 * 
 * @param canonicalId 
 * @returns 
 */
export const calculateTotalSalesPerCourse = withAuth(async (): Promise<CourseSalesDto[]> => {
    try {
        return await prismaCourseAnalyticsReadPort.findSalesByCourse();
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
});

/**
 * 
 * @returns 
 */
export const calculateTotalSalesByMonth = withAuth(async (): Promise<MonthlyCountDto> => {
    try {
        return await prismaCourseAnalyticsReadPort.findApprovedSalesByMonth();
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}, { requireEmailVerified: false });

/**
 * 
 * @returns 
 */
export const calculateUsersRegisteredByMonth = withAuth(async (): Promise<MonthlyCountDto> => {
    try {
        return await prismaCourseAnalyticsReadPort.findRegisteredUsersByMonth();
    } catch (error) {
        logPrismaError(error);
        throw error;
    }
}, { requireEmailVerified: false });
