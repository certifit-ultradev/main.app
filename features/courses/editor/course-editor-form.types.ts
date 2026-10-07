/** Browser-only editor state. Files must not cross a server-action boundary. */
export type CourseEditorAsset = File | string | null;

export type CourseEditorOption = { id?: number; clientKey?: string; value: string; isCorrect: boolean };
type CourseEditorQuestionBase = {
    id?: number; clientKey?: string;
    title: string;
    points: number;
};
export type CourseEditorQuestion = CourseEditorQuestionBase & (
    | { type: 'text'; expectedAnswer: { value: string }; options?: never }
    | { type: 'multiple'; options: CourseEditorOption[]; expectedAnswer?: never }
);
export type CourseEditorClass = {
    id?: number; clientKey?: string;
    title: string;
    description: string;
    video: CourseEditorAsset;
    videoSize?: number;
    videoDuration?: number;
};
export type CourseEditorQuiz = {
    id?: number; clientKey?: string; title: string; description: string; questions: CourseEditorQuestion[];
};
export type CourseEditorModule = {
    id?: number; clientKey?: string;
    title: string;
    minRequiredPoints: number;
    classes: CourseEditorClass[];
    quiz: CourseEditorQuiz;
};
export type CourseEditorFormValues = {
    id?: number;
    title: string;
    price: number;
    courseImage: CourseEditorAsset;
    instructorName: string;
    instructorPhoto: CourseEditorAsset;
    category: { id: number; name: string } | null;
    description: string;
    expiresAt: string;
    modules: CourseEditorModule[];
};

/** Serializable action input after each local asset has been uploaded. */
export type PersistableCourseEditorQuestion = Omit<CourseEditorQuestionBase, 'clientKey'> & (
    | { type: 'text'; expectedAnswer: { value: string }; options?: never }
    | { type: 'multiple'; options: Array<Omit<CourseEditorOption, 'clientKey'>>; expectedAnswer?: never }
);

export type PersistableCourseEditorDraft = Omit<CourseEditorFormValues, 'courseImage' | 'instructorPhoto' | 'modules'> & {
    courseImage: string;
    instructorPhoto: string;
    modules: Array<Omit<CourseEditorModule, 'clientKey' | 'classes' | 'quiz'> & {
        classes: Array<Omit<CourseEditorClass, 'clientKey' | 'video'> & { video: string | null }>;
        quiz: Omit<CourseEditorModule['quiz'], 'clientKey' | 'questions'> & {
            questions: PersistableCourseEditorQuestion[];
        };
    }>;
};

export function toPersistableCourseEditorDraft(data: CourseEditorFormValues): PersistableCourseEditorDraft {
    const requireStoredAsset = (asset: CourseEditorAsset, field: string): string => {
        if (typeof asset !== 'string' || asset.length === 0) {
            throw new Error(`${field} debe estar cargado antes de guardar el curso`);
        }
        return asset;
    };

    return {
        ...data,
        courseImage: requireStoredAsset(data.courseImage, 'La imagen del curso'),
        instructorPhoto: requireStoredAsset(data.instructorPhoto, 'La foto del instructor'),
        modules: data.modules.map(({ clientKey: _moduleKey, classes, quiz, ...module }) => {
            const { clientKey: _quizKey, questions, ...persistableQuiz } = quiz;

            return {
                ...module,
                classes: classes.map(({ clientKey: _classKey, video, ...courseClass }) => ({
                    ...courseClass,
                    video: video === null
                        ? null
                        : requireStoredAsset(video, 'El video de la clase'),
                })),
                quiz: {
                    ...persistableQuiz,
                    questions: questions.map((question): PersistableCourseEditorQuestion => {
                        if (question.type === 'text') {
                            return {
                                id: question.id,
                                title: question.title,
                                points: question.points,
                                type: 'text',
                                expectedAnswer: { value: question.expectedAnswer.value },
                            };
                        }
                        return {
                            id: question.id,
                            title: question.title,
                            points: question.points,
                            type: 'multiple',
                            options: question.options.map(({ clientKey: _optionKey, ...option }) => option),
                        };
                    }),
                },
            };
        }),
    };
}
