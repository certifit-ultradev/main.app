import type { StudentCourseDto } from './student-course.dto';

export type CatalogCourseCardDto = {
    id: number;
    canonicalId: string;
    title: string;
    description: string;
    price: number;
    courseImage: string;
    courseDuration: string;
    instructorName: string;
    instructorPhoto: string;
    category: { id: number; name: string } | null;
    expiresAt: string;
    alreadyPurchased: boolean;
};

export type AuthorQuestionValidationIssue =
    | 'missing_text_answer'
    | 'insufficient_options'
    | 'empty_option'
    | 'invalid_correct_answer_count';

type AuthorQuestionBase = {
    id: number;
    title: string;
    points: number;
    /** Present only when persisted legacy content needs author correction. */
    validationIssue?: AuthorQuestionValidationIssue;
};
export type AuthorQuestionDto = AuthorQuestionBase & (
    | { type: 'text'; expectedAnswer: { value: string }; options?: never }
    | { type: 'multiple'; options: Array<{ id: number; value: string; isCorrect: boolean }>; expectedAnswer?: never }
);

export type { CourseEditorListItemDto, CourseEditorPageDto } from './course-read.ports';

export type CourseEditorDto = {
    id: number;
    isActive?: boolean;
    canonicalId: string;
    title: string;
    description: string;
    price: number;
    courseImage: string;
    instructorName: string;
    instructorPhoto: string;
    expiresAt: string;
    category: { id: number; name: string } | null;
    modules: Array<{
        id: number;
        title: string;
        minRequiredPoints: number;
        classes: Array<{
            id: number;
            title: string;
            description: string;
            video: string | null;
            videoSize: number | null;
            videoDuration: number | null;
        }>;
        quiz: {
            id: number;
            title: string;
            description: string;
            questions: AuthorQuestionDto[];
        } | null;
    }>;
};

export type { StudentCourseDto };
