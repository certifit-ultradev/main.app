import type { CatalogCourseCardDto, CourseEditorDto } from '@/application/courses/course.dto';
import { Course } from '@/models/course';
import { formatCourseVideoDuration as formatVideoDuration } from '@/application/courses/course-video';
import { toAuthorQuestionDto } from './course-question-mapper';

const toCategory = (course: Course) => course.category?.id && course.category.name
    ? { id: course.category.id, name: course.category.name }
    : null;

const requirePersistedId = (id: number | undefined, entity: string): number => {
    if (!Number.isInteger(id) || id === undefined || id <= 0) {
        throw new Error(`${entity} no tiene un identificador persistido válido`);
    }
    return id;
};

const getCourseDuration = (course: Course): string => formatVideoDuration(
    (course.courseModules ?? []).reduce(
        (courseDuration, module) => courseDuration + (module.moduleClass ?? []).reduce(
            (moduleDuration, courseClass) => moduleDuration + (courseClass.videoDuration ?? 0),
            0,
        ),
        0,
    ),
);

export function toCatalogCourseCardDto(course: Course, alreadyPurchased: boolean): CatalogCourseCardDto {
    return {
        id: requirePersistedId(course.id, 'Curso'),
        canonicalId: course.canonicalId,
        title: course.title,
        description: course.description,
        price: course.price,
        courseImage: course.courseImage,
        courseDuration: getCourseDuration(course),
        instructorName: course.instructorName,
        instructorPhoto: course.instructorPhoto,
        category: toCategory(course),
        expiresAt: course.expiresAt.toISOString(),
        alreadyPurchased,
    };
}

export function toCourseEditorDto(course: Course): CourseEditorDto {
    return {
        id: requirePersistedId(course.id, 'Curso'),
        canonicalId: course.canonicalId,
        title: course.title,
        description: course.description,
        price: course.price,
        courseImage: course.courseImage,
        instructorName: course.instructorName,
        instructorPhoto: course.instructorPhoto,
        expiresAt: course.expiresAt.toISOString(),
        category: toCategory(course),
        modules: (course.courseModules ?? []).map((module) => {
            const quiz = module.moduleQuiz?.[0];
            return {
                id: requirePersistedId(module.id, 'Módulo'),
                title: module.title,
                minRequiredPoints: module.minRequiredPoints,
                classes: (module.moduleClass ?? []).map((courseClass) => ({
                    id: requirePersistedId(courseClass.id, 'Clase'),
                    title: courseClass.title,
                    description: courseClass.description,
                    video: courseClass.videoPath ?? null,
                    videoSize: courseClass.videoSize ?? null,
                    videoDuration: courseClass.videoDuration ?? null,
                })),
                quiz: quiz ? {
                    id: requirePersistedId(quiz.id, 'Quiz'),
                    title: quiz.title,
                    description: quiz.description,
                    questions: (quiz.quizQuestion ?? []).map((question) => toAuthorQuestionDto({
                        id: requirePersistedId(question.id, 'Pregunta'),
                        type: question.type,
                        title: question.title,
                        points: question.points,
                        possibleAnswerQuestion: (question.possibleAnswerQuestion ?? []).map((option) => ({
                            id: requirePersistedId(option.id, 'Opción'),
                            value: option.value,
                            isCorrect: option.isCorrect,
                        })),
                    })),
                } : null,
            };
        }),
    };
}
