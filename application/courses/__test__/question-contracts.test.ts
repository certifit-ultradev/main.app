import type { CourseEditorQuestionPatch } from '@/application/courses/course-editor.commands';
import type { AuthorQuestionDto } from '@/application/courses/course.dto';
import type { StudentQuestionDto } from '@/application/courses/student-course.dto';

describe('question contracts', () => {
    it('keep author, student, text and selection variants separate at compile time', () => {
        // These assignments are compile-time checks; no invalid value reaches a runtime boundary.
        if (false) {
            // @ts-expect-error text commands cannot carry selectable options
            const textWithOptions: CourseEditorQuestionPatch = { type: 'text', title: 'T', points: 1, expectedAnswer: { value: 'A' }, options: [{ value: 'A', isCorrect: true }] };
            // @ts-expect-error multiple-choice commands need at least two options
            const oneOption: CourseEditorQuestionPatch = { type: 'multiple', title: 'M', points: 1, options: [{ value: 'A', isCorrect: true }] };
            // @ts-expect-error student questions never carry a correction
            const studentWithAnswer: StudentQuestionDto = { id: 1, type: 'text', title: 'T', expectedAnswer: { id: 2, value: 'A' } };
            // @ts-expect-error author text questions do not expose fake options
            const authorTextWithOptions: AuthorQuestionDto = { id: 1, type: 'text', title: 'T', points: 1, expectedAnswer: { id: 2, value: 'A' }, options: [] };
            // @ts-expect-error a text answer is stored in the question, not an option with an ID
            const authorTextWithOptionId: AuthorQuestionDto = { id: 1, type: 'text', title: 'T', points: 1, expectedAnswer: { id: 2, value: 'A' } };
            // @ts-expect-error text answer patches cannot reuse a legacy option ID
            const textPatchWithOptionId: CourseEditorQuestionPatch = { type: 'text', title: 'T', points: 1, expectedAnswer: { id: 2, value: 'A' } };
            void [textWithOptions, oneOption, studentWithAnswer, authorTextWithOptions, authorTextWithOptionId, textPatchWithOptionId];
        }
        expect(true).toBe(true);
    });
});
