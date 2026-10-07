export type SubmitQuizAnswerCommand = {
    canonicalId: string;
    moduleId: number;
    quizId: number;
} & (
    | {
        questionId: number;
        kind: 'text';
        answer: string;
    }
    | {
        questionId: number;
        kind: 'multiple_choice';
        optionId: number;
    }
);

export type CalculateQuizScoreCommand = {
    canonicalId: string;
    moduleId: number;
    quizId: number;
};

export type ResultQuizScore = { questionCount: number; totalScore: number; pass: boolean };
