import type { CourseEditorPatch, CourseEditorQuestionPatch, CreateCourseCommand } from '@/application/courses/course-editor.commands';
import type { AdminCourseInput } from './admin.contract';

function atLeastTwo<T>(items: T[]): [T, T, ...T[]] {
    if (items.length < 2) throw new Error('La pregunta de selección requiere al menos dos opciones');
    return [items[0], items[1], ...items.slice(2)];
}

function toQuestionPatch(question: AdminCourseInput['modules'][number]['quiz']['questions'][number]): CourseEditorQuestionPatch {
    const base = { id: question.id, title: question.title, points: question.points };
    if (question.type === 'text') {
        return { ...base, type: 'text', expectedAnswer: { value: question.expectedAnswer.value } };
    }
    return {
        ...base,
        type: 'multiple',
        options: atLeastTwo(question.options.map(({ id, value, isCorrect }) => ({ id, value, isCorrect }))),
    };
}

/** Translates the validated action contract into the application write command. */
export function toCourseEditorPatch(course: AdminCourseInput): CourseEditorPatch {
    return {
        title: course.title,
        description: course.description,
        price: course.price,
        categoryId: course.category.id,
        instructorName: course.instructorName,
        courseImage: course.courseImage,
        instructorPhoto: course.instructorPhoto,
        expiresAt: new Date(course.expiresAt),
        modules: course.modules.map((module) => ({
            id: module.id,
            title: module.title,
            minRequiredPoints: module.minRequiredPoints,
            classes: module.classes.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                videoPath: lesson.video ?? '',
                videoSize: lesson.videoSize ?? 0,
                videoDuration: lesson.videoDuration ?? 0,
            })),
            quiz: {
                id: module.quiz.id,
                title: module.quiz.title,
                description: module.quiz.description,
                questions: module.quiz.questions.map(toQuestionPatch),
            },
        })),
    };
}

/** Removes editor IDs and turns a validated action payload into an aggregate creation command. */
export function toCreateCourseCommand(course: AdminCourseInput): CreateCourseCommand {
    const patch = toCourseEditorPatch(course);
    return {
        title: patch.title,
        description: patch.description,
        price: patch.price,
        categoryId: patch.categoryId,
        instructorName: patch.instructorName,
        courseImage: patch.courseImage,
        instructorPhoto: patch.instructorPhoto,
        expiresAt: patch.expiresAt,
        modules: patch.modules.map((module) => ({
            title: module.title,
            minRequiredPoints: module.minRequiredPoints,
            classes: module.classes.map((lesson) => ({
                title: lesson.title,
                description: lesson.description,
                videoPath: lesson.videoPath,
                videoSize: lesson.videoSize,
                videoDuration: lesson.videoDuration,
            })),
            quiz: {
                title: module.quiz.title,
                description: module.quiz.description,
                questions: module.quiz.questions.map((question) => question.type === 'text'
                    ? { title: question.title, points: question.points, type: 'text' as const, expectedAnswer: question.expectedAnswer.value }
                    : {
                        title: question.title,
                        points: question.points,
                        type: 'multiple' as const,
                        options: atLeastTwo(question.options.map(({ value, isCorrect }) => ({ value, isCorrect }))),
                    }),
            },
        })),
    };
}
