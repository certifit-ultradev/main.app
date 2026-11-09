import {
    CalculateQuizScoreRequestSchema,
    LastQuizAttemptResponseSchema,
    QuizAnswerSavedResponseSchema,
    QuizAttemptResultResponseSchema,
    QuizStoredAnswerResponseSchema,
    SubmitQuizAnswerRequestSchema,
    type CalculateQuizScoreRequest,
    type LastQuizAttemptResponse,
    type QuizAttemptResultResponse,
    type QuizStoredAnswerResponse,
    type SubmitQuizAnswerRequest,
} from '@/interfaces/http/courses/quiz.contract';
import { ApiFailureSchema, apiSuccessSchema } from '@/interfaces/http/api-response.schema';

type Fetcher = typeof fetch;

export class QuizHttpError extends Error {
    constructor(message: string, readonly status: number) {
        super(message);
        this.name = 'QuizHttpError';
    }
}

async function requestJson(fetcher: Fetcher, input: RequestInfo | URL, init?: RequestInit): Promise<unknown> {
    const response = await fetcher(input, init);
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
        const failure = ApiFailureSchema.safeParse(payload);
        const message = failure.success ? failure.data.error.message : 'No fue posible completar la operación del quiz.';
        throw new QuizHttpError(message, response.status);
    }

    return payload;
}

function jsonPost(body: unknown): RequestInit {
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}

export async function loadQuizAnswers(
    canonicalId: string,
    quizId: number,
    fetcher: Fetcher = fetch,
): Promise<QuizStoredAnswerResponse[]> {
    const payload = await requestJson(fetcher, `/api/courses/${canonicalId}/quizzes/${quizId}`);
    const parsed = apiSuccessSchema(QuizStoredAnswerResponseSchema.array()).safeParse(payload);
    if (!parsed.success) throw new QuizHttpError('La respuesta del quiz no tiene el formato esperado.', 502);
    return parsed.data.data;
}

export async function loadLastQuizAttempt(
    canonicalId: string,
    quizId: number,
    fetcher: Fetcher = fetch,
): Promise<LastQuizAttemptResponse | null> {
    try {
        const payload = await requestJson(fetcher, `/api/courses/${canonicalId}/quizzes/${quizId}/last-result`);
        const parsed = apiSuccessSchema(LastQuizAttemptResponseSchema).safeParse(payload);
        if (!parsed.success) throw new QuizHttpError('El intento de quiz no tiene el formato esperado.', 502);
        return parsed.data.data;
    } catch (error) {
        if (error instanceof QuizHttpError && error.status === 404) return null;
        throw error;
    }
}

export async function saveQuizAnswer(
    command: SubmitQuizAnswerRequest,
    fetcher: Fetcher = fetch,
): Promise<void> {
    const payload = await requestJson(fetcher, '/api/courses/quiz-answer', jsonPost(SubmitQuizAnswerRequestSchema.parse(command)));
    if (!apiSuccessSchema(QuizAnswerSavedResponseSchema).safeParse(payload).success) {
        throw new QuizHttpError('No fue posible guardar la respuesta.', 502);
    }
}

export async function calculateQuizAttempt(
    command: CalculateQuizScoreRequest,
    fetcher: Fetcher = fetch,
): Promise<QuizAttemptResultResponse> {
    const payload = await requestJson(fetcher, '/api/courses/calculate-quiz-score', jsonPost(CalculateQuizScoreRequestSchema.parse(command)));
    const parsed = apiSuccessSchema(QuizAttemptResultResponseSchema).safeParse(payload);
    if (!parsed.success) throw new QuizHttpError('El resultado del quiz no tiene el formato esperado.', 502);
    return parsed.data.data;
}
