import { cn } from '@/lib/utils';
import { QuizModule } from '@/utils/types';
import React, { useState } from 'react';
import { InfoOutlined } from '@mui/icons-material';
import SubmitButton from '../submitButton';
import { Button } from '../ui/button';

interface QuizProps {
    quiz: QuizModule;
    minRequiredPoints: number;
    onQuizFinish: (score: number, passed: boolean) => void;
}

export const QuizView = ({ quiz, minRequiredPoints, onQuizFinish }: QuizProps) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);

    const currentQuestion = quiz.questions?.[currentQuestionIndex];

    const handleAnswerChange = (questionId: number, answer: string) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: answer,
        }));
    };

    const calculateScore = () => {
        let correctAnswers = 0;
        quiz.questions?.forEach((question) => {
            if (question.type === 'multiple') {
                const correctOption = question.options?.find((option) => option.isCorrect);
                if (correctOption && answers[question.id] === correctOption.value) {
                    correctAnswers += question.points;
                }
            } else if (question.type === 'text') {
                // Aquí podrías agregar lógica adicional para validar respuestas de tipo texto si es necesario
            }
        });

        return correctAnswers;
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (quiz.questions?.length || 0) - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            const totalScore = calculateScore();
            setScore(totalScore);
            setIsFinished(true);
            onQuizFinish(totalScore, totalScore >= minRequiredPoints);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setIsFinished(false);
        }
    };

    return (
        <div>
            {!isStarted && !isFinished && (
                <div>
                    <h2 className={cn('text-2xl font-bold mb-4')}>Quiz #{quiz.id} - {quiz.title}</h2>
                    <p className={cn('mb-4')}>{quiz.description}</p>
                    <div className={cn('mb-6')}>
                        <h3 className={cn('text-lg font-semibold mb-2')}>Detalles del Examen:</h3>
                        <ul className={cn('list-disc list-inside text-gray-700')}>
                            <li>Duración: 10 minutos</li>
                            <li>Número de Preguntas: {quiz.questions?.length} preguntas</li>
                            <li>Puntaje Mínimo Aprobatorio: {minRequiredPoints}</li>
                            <li>Intentos Permitidos: 1 intento</li>
                        </ul>
                    </div>
                    <SubmitButton
                        label='Empezar'
                        customClass={cn('bg-[#0BBBE7] text-white px-6 py-2 rounded-md hover:bg-[#009fdf] transition-colors')}
                        onClick={() => setIsStarted(true)}
                    />
                </div>
            )}
            {isStarted && currentQuestion && (
                <div>
                    <h2 className={cn('text-2xl font-bold mb-4')}>Quiz #{quiz.id} - {quiz.title}</h2>
                    <p className={cn('mb-2 text-gray-700')}>Pregunta {currentQuestionIndex + 1} de {quiz.questions?.length}</p>
                    <div className={cn('bg-gray-100 p-4 rounded-md mb-4')}>
                        <p className={cn('text-md mb-1')}>El valor de la pregunta es: {currentQuestion.points}</p>
                        <p className={cn('text-lg font-semibold mb-4')}>{currentQuestion.title}</p>
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
                                            checked={answers[currentQuestion.id] === option.isCorrect}
                                            onChange={() => handleAnswerChange(currentQuestion.id, option.value)}
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
                                    value={`La respuesta es: ${currentQuestion.options[0].value}`}
                                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                    className={cn('w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0BBBE7]')}
                                    placeholder='Escribe tu respuesta aquí...'
                                />
                            </div>
                        )}
                    </div>

                    <div className={cn('flex justify-between mt-6')}>
                        {currentQuestionIndex > 0 && (
                            <Button
                                className={cn('border border-[#0BBBE7] text-[#0BBBE7] px-6 py-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1')}
                                onClick={handlePreviousQuestion}
                            >
                                Atrás
                            </Button>
                        )}
                        <Button
                            className={cn('bg-[#0BBBE7] text-white px-6 py-2 rounded-md hover:bg-[#009fdf] transition-colors')}
                            onClick={handleNextQuestion}
                        >
                            {currentQuestionIndex === quiz.questions?.length - 1 ? 'Enviar' : 'Continuar'}
                        </Button>
                    </div>
                </div>
            )}

            {isFinished && (
                <div className={cn('text-center')}>
                    <h2 className={cn('text-2xl font-bold mb-4')}>Quiz #{quiz.id} - {quiz.title}</h2>
                    <div className={cn('bg-gray-100 p-6 rounded-md mb-6')}>
                        <h3 className={cn('text-6xl font-bold mb-4')}>{score}</h3>
                        {score >= minRequiredPoints ? (
                            <p className={cn('text-xl font-semibold text-green-600')}>¡Felicidades, has aprobado!</p>
                        ) : (
                            <p className={cn('text-xl font-semibold text-red-600')}>Lo siento, no has aprobado. Inténtalo nuevamente.</p>
                        )}
                    </div>
                    <button
                        className={cn('bg-[#0BBBE7] text-white px-6 py-2 rounded-md hover:bg-[#009fdf] transition-colors')}
                        onClick={() => setIsFinished(false)}
                    >
                        {score >= minRequiredPoints ? 'Continuar' : 'Volver a intentar'}
                    </button>
                </div>
            )}
        </div>
    );
};
