import { cn } from '@/lib/utils';
import { QuizModule, ResultQuizScore } from '@/utils/types';
import React, { useEffect, useState } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import SubmitButton from '@/components/submitButton';
import { Button } from '@/components/ui/button';
import { StepProgress } from '@/components/progress/step-progress';
import { CheckIcon, XIcon } from '@/components/svg/certifit-icons';


interface QuizProps {
    quiz: QuizModule;
    quizIndex: number;
    courseCanonicalId: string;
    minRequiredPoints: number;
    onQuizFinish: (score: number, passed: boolean) => void;
}

type FetchedAnswer = {
    questionId: number;
    answer: string;
};

export const ClientQuizView = ({ quiz, quizIndex, courseCanonicalId, minRequiredPoints, onQuizFinish }: QuizProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [score, setScore] = useState<ResultQuizScore|null>(null);

    const currentQuestion = quiz.questions?.[currentQuestionIndex];

    useEffect(() => {
        fetch(`/api/courses/${courseCanonicalId}/quizzes/${quiz.id}`, {
            method: 'GET'
        }).then(async (response) => {
            const fetchedAnswers: FetchedAnswer[] = await response.json();
            setAnswers(
                fetchedAnswers.reduce((acc: Record<number, string>, curr: FetchedAnswer) => {
                    acc[curr.questionId] = curr.answer;
                    return acc;
                }, {} as Record<number, string>)
            );
            fetch(`/api/courses/${courseCanonicalId}/quizzes/${quiz.id}/last-result`, {
                method: 'GET'
            }).then(async (response) => {
                const lastResult = await response.json();
                if (lastResult.passed != undefined) {
                    setIsFinished(true);
                    setIsStarted(false);
                    setScore({
                        pass: lastResult.passed,
                        questionCount:0,
                        totalScore: lastResult.result
                    });
                }
            });
        });
    }, [courseCanonicalId, quiz.id]);

    const handleAnswerChange = (questionId: number, optionId: number, answer: string) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: answer,
        }));

        fetch('/api/courses/quiz-answer', {
            method: 'POST', body: JSON.stringify({
                canonicalId: courseCanonicalId, questionId, quizId: quiz.id, moduleId: quiz.courseModuleId, optionId, answer
            })
        });
    };

    const calculateScore = () => {
        fetch('/api/courses/calculate-quiz-score', {
            method: 'POST', body: JSON.stringify({
                canonicalId: courseCanonicalId, quizId: quiz.id, moduleId: quiz.courseModuleId
            })
        }).then(async (response) => {
            const result = await response.json();
            setIsLoading(false)
            setIsFinished(true);
            setIsStarted(false);
            setScore(result);
        });
    };

    const handleNextQuestion = () => {
        const isLast = currentQuestionIndex < (quiz.questions?.length || 0) - 1;
        if (isLast) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setIsLoading(true);
            calculateScore();
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setIsFinished(false);
        }
    };

    const handleContinueCourse = () => {
        if (!score) {
            return;
        }

        if (score.totalScore >= minRequiredPoints) {
            onQuizFinish(score.totalScore, score.pass);
        } else {
            setCurrentQuestionIndex(0);
            setIsFinished(false)
        }
    }

    const handleRetryQuiz = () => {
        setCurrentQuestionIndex(0);
        setIsFinished(false)
        setIsStarted(true)
    }

    return (
        <div>
            {!isStarted && !isFinished && !score && (
                <div className={cn('w-full border border-[#ececec] bg-[#ececec] rounded-2xl p-6 overflow-y-auto max-h-[70vh]')}>
                    <h2 className={cn('text-2xl font-bold mb-4')}>Quiz #{quizIndex + 1} - {quiz.title}</h2>
                    <p className={cn('mb-4')}>{quiz.description}</p>
                    <div className={cn('mb-6')}>
                        <h3 className={cn('text-lg font-semibold mb-2')}>Detalles del Examen:</h3>
                        <ul className={cn('list-disc list-inside text-gray-700')}>
                            <li>Duración: 10 minutos</li>
                            <li>Número de Preguntas: {quiz.questions?.length} preguntas</li>
                            <li>Puntaje Mínimo Aprobatorio: {minRequiredPoints} puntos</li>
                        </ul>
                    </div>
                    <div className={cn('flex flex-col mb-4 items-center w-full')}>
                        <SubmitButton
                            label={score ? 'Volver a intentar' : 'Empezar'}
                            customClass={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                            onClick={() => setIsStarted(true)}
                        />
                    </div>
                </div>
            )}
            {isStarted && currentQuestion && (
                <div className={cn('bg-gray-100 p-4 rounded-2xl mb-4')}>
                    <h2 className={cn('text-2xl font-bold mb-4')}>Quiz #{quizIndex + 1} - {quiz.title}</h2>
                    <div className={cn('bg-gray-100 p-4 rounded-2xl mb-2')}> <StepProgress step={currentQuestionIndex + 1} max={quiz.questions?.length ?? 0} label="Pregunta" /> </div>
                    <div>
                        <p className={cn('text-lg font-semibold mb-4')}>{currentQuestionIndex + 1}. {currentQuestion.title}</p>
                        {currentQuestion.type === 'multiple' && (
                            <div className={cn('space-y-4')}>
                                <div className={cn('flex justify-center')}>
                                    <span className={cn('flex items-center')}>Selección multiple <InfoOutlined width={20} height={20} className={cn('text-5xl text text-[#2A8940]')} /> </span>
                                </div>
                                {currentQuestion.options?.map((option, index) => (
                                    <label key={index} className={cn('block')}>
                                        <input
                                            type='radio'
                                            name={`question-${currentQuestion.id}`}
                                            value={option.value}
                                            checked={answers[currentQuestion.id ?? 0] === option.value}
                                            onChange={() => handleAnswerChange(currentQuestion.id ?? 0, option.id ?? 0, option.value)}
                                            className={cn('mr-2')}
                                        />
                                        {`${option.value} ${option.isCorrect ? ' - Esta es la respuesta correcta' : ''}`}
                                    </label>
                                ))}
                            </div>
                        )}
                        {currentQuestion.type === 'text' && (
                            <div className={cn('space-y-4')}>
                                <div className={cn('flex justify-center')}>
                                    <span className={cn('flex items-center')}>Pregunta abierta <InfoOutlined width={20} height={20} className={cn('text-5xl text text-[#2A8940]')} /> </span>
                                </div>
                                <textarea
                                    value={answers[currentQuestion.id ?? 0] ?? ""}
                                    onChange={(e) => {
                                        const optionId = currentQuestion.options?.[0]?.id ?? 0;
                                        handleAnswerChange(currentQuestion.id ?? 0, optionId, e.target.value);
                                    }}
                                    className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBBE7]')}
                                    placeholder='Escribe tu respuesta aquí...'
                                />
                            </div>
                        )}
                        <div className={cn('inline-flex mb-4 justify-center w-full gap-2 mt-4')}>
                            {currentQuestionIndex > 0 && (
                                <Button
                                    className={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                                    onClick={handlePreviousQuestion}
                                >
                                    Atrás
                                </Button>
                            )}
                            <SubmitButton
                                disabled={isLoading}
                                isLoading={isLoading}
                                label={currentQuestionIndex === (quiz.questions?.length ?? 0) - 1 ? 'Finalizar' : 'Siguiente'}
                                customClass={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                                onClick={handleNextQuestion}
                            />
                        </div>
                    </div>
                </div>
            )}

            {isFinished && score && (
                <>
                    { score.totalScore >= minRequiredPoints ? (
                        <div className={cn('bg-gray-100 p-6 rounded-3xl mb-4')}>
                            <h2 className={cn('text-2xl font-bold mb-4')}>Quiz #{quiz.id} - {quiz.title}</h2>
                            <div className={cn('flex flex-col items-center bg-gray-200 p-6 rounded-3xl mb-6')}>
                                <div className={cn('rounded-2xl flex items-center justify-center w-[89px] h-[89px] bg-[#EBF9EE]')}>
                                    <div className={cn('rounded-2xl flex items-center justify-center w-[65px] h-[65px] bg-[#CEF4D7]')}>
                                        <CheckIcon width={60} height={60} className={cn('text-5xl text text-[#2A8940]')} />
                                    </div>
                                </div>
                                <p>Calificación</p>
                                <h3 className={cn('text-6xl font-bold mb-4')}>{score.totalScore}</h3>
                                <>
                                    <p className={cn('text-2xl font-medium')}>¡Felicitaciones, has aprobado!</p>
                                    <span className={cn('ml-3')}>Puedes continuar con la siguiente lección</span>
                                </>
                                <div className={cn('inline-flex mb-4 justify-center w-full gap-2 mt-12')}>
                                    <Button
                                        className={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                                        onClick={() => { handleContinueCourse() }}
                                    >
                                        Continuar
                                    </Button>
                                    <Button
                                        className={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                                        onClick={() => { handleRetryQuiz() }}
                                    >
                                        Volver a intentar
                                    </Button>

                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={cn('bg-gray-100 p-6 rounded-3xl mb-4')}>
                            <h2 className={cn('text-2xl font-bold mb-4')}>Quiz #{quiz.id} - {quiz.title}</h2>
                            <div className={cn('flex flex-col items-center bg-gray-200 p-6 rounded-3xl mb-6')}>
                                <div className={cn('mb-8')}>
                                    <div className={cn('rounded-2xl flex items-center justify-center w-[89px] h-[89px] bg-[#f9ebeb]')}>
                                        <div className={cn('rounded-2xl flex items-center justify-center w-[65px] h-[65px] bg-[#f4cece]')}>
                                            <XIcon width={60} height={60} className={cn('text-red-500')} />
                                        </div>
                                    </div>
                                </div>
                                <p>Calificación</p>
                                <h3 className={cn('text-6xl font-bold mb-4')}>{score.totalScore}</h3>
                                <>
                                    <p className={cn('text-2xl font-medium')}>¡Has Reprobado!</p>
                                    <span className={cn('ml-3')}>No te desanimes, dale click en volver a intentar</span>
                                </>
                                <div className={cn('inline-flex mb-4 justify-center w-full gap-2 mt-12')}>
                                    <Button
                                        className={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                                        onClick={() => { handleRetryQuiz() }}
                                    >
                                        Volver a intentar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                    }
                </>
            )}
        </div>
    );
};
