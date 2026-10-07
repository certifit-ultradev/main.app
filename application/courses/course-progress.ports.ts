import type {
    ClassProgressUpsert,
    ModuleCompletion,
    QuizAnswerScope,
    QuizAttemptContext,
    QuizAttemptResult,
    QuizQuestionForScoring,
    QuizScope,
    StoredQuizAnswer,
} from './progress.commands';

/**
 * Write boundary for student progress. Implementations must validate the
 * enrollment and hierarchy again inside the operation that writes data.
 * The optional question lookup returns `null`; write commands reject invalid
 * enrollment or hierarchy instead of silently treating them as absent.
 */
export interface CourseProgressWritePort {
    upsertClassProgress(command: ClassProgressUpsert): Promise<void>;
    completeModule(command: ModuleCompletion): Promise<void>;
    findQuizQuestion(scope: QuizAnswerScope): Promise<QuizQuestionForScoring | null>;
    upsertQuizAnswer(scope: QuizAnswerScope, answer: StoredQuizAnswer): Promise<void>;
    recordQuizAttempt(
        scope: QuizScope,
        calculateResult: (context: QuizAttemptContext) => QuizAttemptResult,
    ): Promise<QuizAttemptResult>;
}
