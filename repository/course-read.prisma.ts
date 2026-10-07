import type {
    CourseCatalogReadPort,
    CourseEditorPageDto,
    CourseEditorReadPort,
    StudentCourseReadPort,
    StudentQuizReadPort,
} from '@/application/courses/course-read.ports';
import type { CatalogCourseCardDto, CourseEditorDto } from '@/application/courses/course.dto';
import type { StudentCourseDto, StudentCourseListItemDto } from '@/application/courses/student-course.dto';
import { prisma } from '@/lib/prisma';
import { toAuthorQuestionDto, toStudentQuestionDto } from '@/mappers/course-question-mapper';
import type { Prisma } from '@/prisma/app/generated/prisma/client';

const catalogInclude = {
    category: true,
    courseModules: { include: { moduleClass: true } },
    userCourse: { select: { id: true } },
} as const;

const editorInclude = {
    category: true,
    courseModules: {
        include: {
            moduleClass: { orderBy: { id: 'asc' } },
            moduleQuiz: {
                include: {
                    quizQuestion: {
                        include: { possibleAnswerQuestion: { where: { deletedAt: null }, orderBy: { id: 'asc' } } },
                        orderBy: { id: 'asc' },
                    },
                },
                orderBy: { id: 'asc' },
            },
        },
        orderBy: { id: 'asc' },
    },
} as const;

const studentCourseInclude = {
    category: { select: { id: true, name: true } },
    courseModules: {
        select: {
            id: true,
            courseId: true,
            title: true,
            minRequiredPoints: true,
            moduleClass: {
                select: {
                    id: true,
                    courseModuleId: true,
                    title: true,
                    description: true,
                    videoPath: true,
                    videoSize: true,
                    videoDuration: true,
                },
                orderBy: { id: 'asc' },
            },
            moduleQuiz: {
                select: {
                    id: true,
                    courseModuleId: true,
                    title: true,
                    description: true,
                    quizQuestion: {
                        select: {
                            id: true,
                            type: true,
                            title: true,
                            possibleAnswerQuestion: {
                                where: { deletedAt: null },
                                select: { id: true, value: true },
                                orderBy: { id: 'asc' },
                            },
                        },
                        orderBy: { id: 'asc' },
                    },
                },
                orderBy: { id: 'asc' },
            },
        },
        orderBy: { id: 'asc' },
    },
} as const;

const studentEnrollmentInclude = {
    course: { include: studentCourseInclude },
    userClassesState: {
        select: { classId: true, currentVideoTime: true, completed: true, createdAt: true },
        orderBy: { id: 'desc' },
    },
    userModuleState: {
        select: { moduleId: true, completed: true, createdAt: true },
        orderBy: { id: 'desc' },
    },
    userQuizState: {
        select: { quizId: true, courseModuleId: true, result: true, retries: true, passed: true, createdAt: true },
        orderBy: { id: 'desc' },
    },
} as const;

const studentCourseListInclude = {
    course: {
        select: {
            canonicalId: true,
            title: true,
            price: true,
            courseImage: true,
            instructorName: true,
            instructorPhoto: true,
            description: true,
            expiresAt: true,
            category: { select: { id: true, name: true } },
            courseModules: {
                select: {
                    moduleClass: { select: { id: true, title: true, videoDuration: true }, orderBy: { id: 'asc' } },
                },
                orderBy: { id: 'asc' },
            },
        },
    },
    userClassesState: {
        select: { classId: true, currentVideoTime: true, completed: true, createdAt: true },
        orderBy: { id: 'desc' },
    },
    userModuleState: {
        select: { moduleId: true, completed: true, createdAt: true },
        orderBy: { id: 'desc' },
    },
} as const;

type CatalogCourseRow = Prisma.CourseGetPayload<{ include: typeof catalogInclude }>;
type EditorCourseRow = Prisma.CourseGetPayload<{ include: typeof editorInclude }>;
type StudentEnrollmentRow = Prisma.UserCourseGetPayload<{ include: typeof studentEnrollmentInclude }>;
type StudentCourseListRow = Prisma.UserCourseGetPayload<{ include: typeof studentCourseListInclude }>;

function toCategory(category: { id: number; name: string } | null): { id: number; name: string } | null {
    return category ? { id: category.id, name: category.name } : null;
}

function duration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function toCatalogCourse(row: CatalogCourseRow): CatalogCourseCardDto {
    const totalDuration = row.courseModules.reduce(
        (sum, module) => sum + module.moduleClass.reduce((classSum, courseClass) => classSum + (courseClass.videoDuration ?? 0), 0),
        0,
    );
    return {
        id: row.id,
        canonicalId: row.canonicalId,
        title: row.title,
        description: row.description,
        price: row.price,
        courseImage: row.courseImage,
        courseDuration: duration(totalDuration),
        instructorName: row.instructorName,
        instructorPhoto: row.instructorPhoto,
        category: toCategory(row.category),
        expiresAt: row.expiresAt.toISOString(),
        alreadyPurchased: row.userCourse.length > 0,
    };
}

function toEditorCourse(row: EditorCourseRow): CourseEditorDto {
    return {
        id: row.id,
        canonicalId: row.canonicalId,
        title: row.title,
        description: row.description,
        price: row.price,
        courseImage: row.courseImage,
        instructorName: row.instructorName,
        instructorPhoto: row.instructorPhoto,
        expiresAt: row.expiresAt.toISOString(),
        category: toCategory(row.category),
        modules: row.courseModules.map((module) => {
            const quiz = module.moduleQuiz[0];
            return {
                id: module.id,
                title: module.title,
                minRequiredPoints: module.minRequiredPoints,
                classes: module.moduleClass.map((courseClass) => ({
                    id: courseClass.id,
                    title: courseClass.title,
                    description: courseClass.description,
                    video: courseClass.videoPath || null,
                    videoSize: courseClass.videoSize ?? null,
                    videoDuration: courseClass.videoDuration ?? null,
                })),
                quiz: quiz ? {
                    id: quiz.id,
                    title: quiz.title,
                    description: quiz.description,
                    questions: quiz.quizQuestion.map(toAuthorQuestionDto),
                } : null,
            };
        }),
    };
}

function toStudentCourse(enrollment: StudentEnrollmentRow): StudentCourseDto {
    const course = enrollment.course;

    return {
        canonicalId: course.canonicalId,
        title: course.title,
        description: course.description,
        courseImage: course.courseImage,
        instructorName: course.instructorName,
        instructorPhoto: course.instructorPhoto,
        expiresAt: course.expiresAt.toISOString(),
        category: toCategory(course.category),
        price: course.price,
        modules: course.courseModules.map((module) => {
            const quiz = module.moduleQuiz[0];
            return {
                id: module.id,
                courseId: course.id,
                title: module.title,
                minRequiredPoints: module.minRequiredPoints,
                classes: module.moduleClass.map((courseClass) => ({
                    id: courseClass.id,
                    courseModuleId: courseClass.courseModuleId,
                    title: courseClass.title,
                    description: courseClass.description,
                    video: courseClass.videoPath || null,
                    videoSize: courseClass.videoSize ?? null,
                    videoDuration: courseClass.videoDuration ?? null,
                })),
                quiz: quiz ? {
                    id: quiz.id,
                    courseModuleId: quiz.courseModuleId,
                    title: quiz.title,
                    description: quiz.description,
                    questions: quiz.quizQuestion.map(toStudentQuestionDto),
                } : null,
            };
        }),
        moduleCompleted: enrollment.userModuleState.map((state) => ({
            moduleId: state.moduleId,
            isCompleted: state.completed,
            createdAt: state.createdAt.toISOString(),
        })),
        classCompleted: enrollment.userClassesState.map((state) => ({
            classId: state.classId,
            currentVideoTime: state.currentVideoTime,
            isCompleted: state.completed,
            createdAt: state.createdAt.toISOString(),
        })),
        quizCompleted: enrollment.userQuizState.map((state) => ({
            quizId: state.quizId,
            courseModuleId: state.courseModuleId,
            result: state.result,
            retries: state.retries,
            passed: state.passed,
            createdAt: state.createdAt.toISOString(),
        })),
    };
}

function toStudentCourseListItem(enrollment: StudentCourseListRow): StudentCourseListItemDto {
    const course = enrollment.course;
    const classes = course.courseModules.flatMap((module) => module.moduleClass);
    const latestClassStates = new Map<number, boolean>();
    for (const state of enrollment.userClassesState) {
        if (!latestClassStates.has(state.classId)) latestClassStates.set(state.classId, state.completed);
    }
    const classesWithCompletion = classes.map((courseClass) => ({
        id: courseClass.id,
        title: courseClass.title,
        completed: latestClassStates.get(courseClass.id) ?? false,
    }));
    const totalClasses = classesWithCompletion.length;
    const completedClasses = classesWithCompletion.filter((courseClass) => courseClass.completed).length;
    const progressPercent = totalClasses === 0 ? 0 : Math.round((completedClasses / totalClasses) * 100);
    const currentIndex = totalClasses === 0
        ? -1
        : classesWithCompletion.findIndex((courseClass) => !courseClass.completed);
    const resolvedCurrentIndex = currentIndex === -1 ? totalClasses - 1 : currentIndex;
    const visibleClasses = totalClasses <= 1
        ? classesWithCompletion
        : resolvedCurrentIndex === totalClasses - 1
            ? classesWithCompletion.slice(Math.max(0, resolvedCurrentIndex - 1), resolvedCurrentIndex + 1)
            : classesWithCompletion.slice(resolvedCurrentIndex, resolvedCurrentIndex + 2);
    const totalDuration = classes.reduce((sum, courseClass) => sum + (courseClass.videoDuration ?? 0), 0);

    return {
        canonicalId: course.canonicalId,
        title: course.title,
        price: course.price,
        courseImage: course.courseImage,
        instructorName: course.instructorName,
        instructorPhoto: course.instructorPhoto,
        courseDuration: duration(totalDuration),
        category: toCategory(course.category),
        description: course.description,
        expiresAt: course.expiresAt.toISOString(),
        classViewed: enrollment.userClassesState.map((state) => ({
            classId: state.classId,
            currentVideoTime: state.currentVideoTime,
            completed: state.completed,
        })),
        moduleViewed: enrollment.userModuleState.map((state) => ({ moduleId: state.moduleId, completed: state.completed })),
        classesWithCompletion,
        progressPercent,
        currentIndex: resolvedCurrentIndex,
        totalClasses,
        visibleClasses,
    };
}

export const prismaCourseCatalogReadPort: CourseCatalogReadPort = {
    async findActiveCatalogCourses(viewerId) {
        const courses = await prisma.course.findMany({
            include: {
                ...catalogInclude,
                userCourse: {
                    where: { userId: viewerId ?? '__anonymous_viewer__' },
                    select: { id: true },
                },
            },
            where: {
                isActive: true,
                deleted: false,
                expiresAt: { gt: new Date() },
            },
        });
        return courses.map(toCatalogCourse);
    },
};

export const prismaStudentCourseReadPort: StudentCourseReadPort = {
    async findEnrolledCourse(canonicalId, studentId) {
        const enrollment = await prisma.userCourse.findFirst({
            include: studentEnrollmentInclude,
            where: {
                userId: studentId,
                course: { canonicalId, deleted: false },
            },
        });
        return enrollment ? toStudentCourse(enrollment) : null;
    },
    async findEnrolledCourses(studentId) {
        const enrollments = await prisma.userCourse.findMany({
            include: studentCourseListInclude,
            where: { userId: studentId, course: { deleted: false } },
            orderBy: { createdAt: 'desc' },
        });
        return enrollments.map(toStudentCourseListItem);
    },
};

export const prismaStudentQuizReadPort: StudentQuizReadPort = {
    async findAnswers(canonicalId, studentId, quizId) {
        return prisma.userQuizAnswer.findMany({
            where: {
                quizId,
                userCourse: {
                    is: { userId: studentId, course: { canonicalId, deleted: false } },
                },
            },
            select: { questionId: true, answer: true },
            orderBy: { id: 'asc' },
        });
    },
    async findLatestAttempt(canonicalId, studentId, quizId) {
        return prisma.userQuizState.findFirst({
            where: {
                quizId,
                userCourse: {
                    is: { userId: studentId, course: { canonicalId, deleted: false } },
                },
            },
            select: { quizId: true, courseModuleId: true, retries: true, result: true, passed: true },
            orderBy: { id: 'desc' },
        });
    },
};

export const prismaCourseEditorReadPort: CourseEditorReadPort = {
    async findEditorCourseById(courseId) {
        const course = await prisma.course.findFirst({ include: editorInclude, where: { id: courseId } });
        return course ? toEditorCourse(course) : null;
    },
    async findEditorCoursePage(page, pageSize): Promise<CourseEditorPageDto> {
        const safePage = Math.max(1, page);
        const [courses, totalCourses] = await Promise.all([
            prisma.course.findMany({
                select: { id: true, title: true, isActive: true },
                where: { deleted: false },
                orderBy: { createdAt: 'desc' },
                skip: (safePage - 1) * pageSize,
                take: pageSize,
            }),
            prisma.course.count({ where: { deleted: false } }),
        ]);
        const lastPage = Math.max(1, Math.ceil(totalCourses / pageSize));
        return { data: courses, page: safePage, lastPage, total: lastPage };
    },
    async countActiveCourses(): Promise<number> {
        return prisma.course.count({ where: { isActive: true, deleted: false } });
    },
};
