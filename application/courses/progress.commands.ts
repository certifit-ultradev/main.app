export type ClassProgressUpsert = Readonly<{
    userId: string;
    canonicalId: string;
    classId: number;
    currentVideoTime: number;
    completed: boolean;
}>;

export type ModuleCompletion = Readonly<{
    userId: string;
    canonicalId: string;
    moduleId: number;
}>;

export type QuizScope = Readonly<{
    userId: string;
    canonicalId: string;
    moduleId: number;
    quizId: number;
}>;

export type QuizAnswerScope = QuizScope & Readonly<{
    questionId: number;
}>;

/** Persisted answer values, computed by the application from the quiz definition. */
export type StoredQuizAnswer = Readonly<{
    answer: string;
    correct: string;
    isCorrect: boolean;
    points: number;
}>;

export type QuizQuestionForScoring = Readonly<{ id: number; points: number }> & (
    | Readonly<{ type: 'text'; expectedAnswer: string; options?: never }>
    | Readonly<{ type: 'multiple'; options: ReadonlyArray<Readonly<{
        id: number;
        value: string;
        isCorrect: boolean;
    }>>; expectedAnswer?: never }>
);

export type QuizAttemptAnswer = Readonly<{
    questionId: number;
    points: number;
}>;

export type QuizAttemptContext = Readonly<{
    questionCount: number;
    minRequiredPoints: number;
    answers: ReadonlyArray<QuizAttemptAnswer>;
}>;

export type QuizAttemptResult = Readonly<{
    questionCount: number;
    totalScore: number;
    pass: boolean;
}>;
