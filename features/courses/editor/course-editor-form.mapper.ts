import type { AuthorQuestionDto, CourseEditorDto } from '@/application/courses/course.dto';
import type { CourseEditorFormValues, CourseEditorQuestion } from './course-editor-form.types';
import { hydrateEditorModules } from './course-editor-modules.reducer';

function toEditorQuestion(question: AuthorQuestionDto): CourseEditorQuestion {
    const base = { id: question.id, title: question.title, points: question.points };
    if (question.type === 'text') {
        return {
            ...base,
            type: 'text',
            expectedAnswer: { value: question.expectedAnswer.value },
        };
    }
    return {
        ...base,
        type: 'multiple',
        options: question.options.map(({ id, value, isCorrect }) => ({ id, value, isCorrect })),
    };
}

/** Maps the author-only read DTO to editable browser state without mutating the DTO. */
export function toCourseEditorFormValues(course: CourseEditorDto): CourseEditorFormValues {
    return {
        id: course.id,
        title: course.title,
        price: course.price,
        courseImage: course.courseImage,
        instructorName: course.instructorName,
        instructorPhoto: course.instructorPhoto,
        category: course.category ? { ...course.category } : null,
        description: course.description,
        expiresAt: course.expiresAt.slice(0, 10),
        modules: hydrateEditorModules(course.modules.map((module) => ({
            id: module.id,
            title: module.title,
            minRequiredPoints: module.minRequiredPoints,
            classes: module.classes.map((courseClass) => ({
                id: courseClass.id,
                title: courseClass.title,
                description: courseClass.description,
                video: courseClass.video,
                videoSize: courseClass.videoSize ?? undefined,
                videoDuration: courseClass.videoDuration ?? undefined,
            })),
            quiz: module.quiz ? {
                id: module.quiz.id,
                title: module.quiz.title,
                description: module.quiz.description,
                questions: module.quiz.questions.map(toEditorQuestion),
            } : { title: '', description: '', questions: [] },
        }))),
    };
}
