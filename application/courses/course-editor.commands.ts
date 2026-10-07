export type CourseEditorOptionPatch = Readonly<{ id?: number; value: string; isCorrect: boolean }>;
type CourseEditorQuestionBase = Readonly<{ id?: number; title: string; points: number }>;
export type CourseEditorQuestionPatch = CourseEditorQuestionBase & (
    | Readonly<{ type: 'text'; expectedAnswer: Readonly<{ value: string }>; options?: never }>
    | Readonly<{ type: 'multiple'; options: readonly [CourseEditorOptionPatch, CourseEditorOptionPatch, ...CourseEditorOptionPatch[]]; expectedAnswer?: never }>
);
export type CourseEditorQuizPatch = Readonly<{
    id?: number; title: string; description: string; questions: readonly CourseEditorQuestionPatch[];
}>;
export type CourseEditorClassPatch = Readonly<{
    id?: number; title: string; description: string; videoPath: string; videoSize: number; videoDuration: number;
}>;
export type CourseEditorModulePatch = Readonly<{
    id?: number; title: string; minRequiredPoints: number;
    classes: readonly CourseEditorClassPatch[]; quiz: CourseEditorQuizPatch;
}>;
/**
 * Full editor replacement, not a sparse object patch: required text fields
 * reject empty input at the action boundary. Nested omitted IDs create new
 * records; nullable class video input becomes the editor's empty path value.
 */
export type CourseEditorPatch = Readonly<{
    title: string; description: string; price: number; categoryId: number;
    instructorName: string; courseImage: string; instructorPhoto: string; expiresAt: Date;
    modules: readonly CourseEditorModulePatch[];
}>;

/** Serializable aggregate creation command. Assets must already be durable URLs. */
export type CreateCourseCommand = Readonly<{
    title: string;
    description: string;
    price: number;
    categoryId: number;
    instructorName: string;
    courseImage: string;
    instructorPhoto: string;
    expiresAt: Date;
    modules: readonly Readonly<{
        title: string;
        minRequiredPoints: number;
        classes: readonly Readonly<{
            title: string;
            description: string;
            videoPath: string;
            videoSize: number;
            videoDuration: number;
        }>[];
        quiz: Readonly<{
            title: string;
            description: string;
            questions: readonly (Readonly<{ title: string; points: number }> & (
                | Readonly<{ type: 'text'; expectedAnswer: string; options?: never }>
                | Readonly<{ type: 'multiple'; options: readonly [Readonly<{ value: string; isCorrect: boolean }>, Readonly<{ value: string; isCorrect: boolean }>, ...Readonly<{ value: string; isCorrect: boolean }>[]]; expectedAnswer?: never }>
            ))[];
        }>;
    }>[];
}>;
