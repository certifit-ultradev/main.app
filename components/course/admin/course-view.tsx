"use client";

import { CoursePublicData, QuizModule } from "@/utils/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { StepProgress } from "@/components/progress/step-progress";
import { CheckIcon, XIcon } from "@/components/svg/certifit-icons";

type CourseViewProps = {
    data: CoursePublicData;
};

export const AdminCourseView = ({ data }: CourseViewProps) => {
    const [selectedClass, setSelectedClass] = useState<{ moduleIndex: number; classIndex: number; classId: number | undefined } | null>(null);
    const [selectedQuiz, setSelectedQuiz] = useState<{ moduleIndex: number; moduleId: number; quizId: number } | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    const selectedClassData = selectedClass
        ? data.modules?.[selectedClass.moduleIndex]?.classes?.[selectedClass.classIndex]
        : null;
    const selectedQuizData = selectedQuiz ? data.modules?.[selectedQuiz.moduleIndex!].quiz : null;

    // Estado para quiz admin
    const [quizState, setQuizState] = useState({
        started: false,
        finished: false,
        currentQuestion: 0,
    });

    const handleStartQuiz = () => setQuizState({ started: true, finished: false, currentQuestion: 0 });
    const handleNextQuestion = (quiz: QuizModule) => {
        if (quizState.currentQuestion < (quiz.questions?.length ?? 0) - 1) {
            setQuizState((s) => ({ ...s, currentQuestion: s.currentQuestion + 1 }));
        } else {
            setQuizState((s) => ({ ...s, finished: true }));
        }
    };
    const handlePrevQuestion = () => {
        if (quizState.currentQuestion > 0) {
            setQuizState((s) => ({ ...s, currentQuestion: s.currentQuestion - 1, finished: false }));
        }
    };
    const handleRetryQuiz = () => setQuizState({ started: true, finished: false, currentQuestion: 0 });

    return (
        <div className={cn("flex flex-col lg:flex-row w-full h-full p-6")}>
            {/* Panel izquierdo: listado de módulos y clases */}
            <div className={cn("lg:w-1/4 w-full border border-[#CCD2DB] rounded-2xl p-4 mb-4 lg:mb-0 overflow-y-auto max-h-[70vh]")}>
                <h1 className={cn("text-2xl font-bold")}>{data.title}</h1>
                <p className={cn("text-gray-600 mb-6")}>
                    {data.modules?.reduce((sum, module) => sum + (module.classes?.length || 0), 0)} clases
                </p>
                <div className={cn("space-y-4")} id="course-items-container">
                    {data.modules?.map((module, moduleIndex) => (
                        <div key={moduleIndex}>
                            <h3 className={cn("font-semibold text-gray-700 mb-2")}>
                                Módulo #{moduleIndex + 1} {module.title}
                            </h3>
                            {module.classes?.map((cls, classIndex) => {
                                const isSelected =
                                    selectedClass &&
                                    selectedClass.moduleIndex === moduleIndex &&
                                    selectedClass.classIndex === classIndex;
                                return (
                                    <div key={classIndex} className={cn("mb-4")}>
                                        <button
                                            id={`class-${moduleIndex}-${classIndex}`}
                                            onClick={() => {
                                                setSelectedClass({ moduleIndex, classIndex, classId: cls.id });
                                                setSelectedQuiz(null);
                                            }}
                                            className={cn(
                                                "relative flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-colors",
                                                isSelected ? "bg-blue-100 border border-[#0BBBE7]" : "bg-white border border-gray-300"
                                            )}
                                        >
                                            <div className={cn("flex-shrink-0")}>
                                                <div
                                                    className={cn(
                                                        "w-5 h-5 rounded-full border flex items-center justify-center",
                                                        isSelected ? "border-[#0BBBE7]" : "border-gray-300"
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <span className={cn("block text-xs text-gray-500 mb-1")}>
                                                    Clase {classIndex + 1}
                                                </span>
                                                <p className={cn("text-base text-[#575B62]")}>{cls.title}</p>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                            {module.quiz && (
                                <button
                                    key={module.quiz.id}
                                    onClick={() => {
                                        setSelectedQuiz({ moduleIndex, moduleId: module.id ?? 0, quizId: module.quiz?.id ?? 0 });
                                        setSelectedClass(null);
                                    }}
                                    className={cn(
                                        "block w-full text-left p-3 rounded-2xl transition-colors",
                                        selectedQuiz &&
                                            selectedQuiz.moduleIndex === moduleIndex &&
                                            selectedQuiz.quizId === module.quiz.id
                                            ? "bg-[#E7F1FF] border border-[#0BBBE7]"
                                            : "bg-white border border-gray-300"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-5 h-5 rounded-full border flex items-center justify-center",
                                            selectedQuiz &&
                                                selectedQuiz.moduleIndex === moduleIndex &&
                                                selectedQuiz.quizId === module.quiz.id
                                                ? "border-[#0BBBE7]"
                                                : "border-gray-300"
                                        )}
                                    />
                                    <span className={cn("text-[#575B62] ml-2")}>{`Quiz # ${moduleIndex + 1}`}</span>
                                    <p className={cn("text-xl")}>{module.quiz.title}</p>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel central: reproductor de video o quiz */}
            <div className={cn("lg:w-2/4 max-h-[70vh] w-full xl:px-6")}>
                <div className={cn("relative bg-white")}>
                    {selectedClassData && selectedClassData.video ? (
                        <div className="relative">
                            <video
                                controls
                                src={`${selectedClassData.video}`}
                                ref={videoRef}
                                className={cn("w-full rounded-xl mb-4")}
                            />
                        </div>
                    ) : selectedQuizData && selectedQuizData.id ? (
                        <div className="bg-gray-100 rounded-xl p-8 text-center">
                            {/* Quiz admin view */}
                            {!quizState.started && !quizState.finished && (
                                <div className={cn('w-full rounded-2xl p-6 overflow-y-auto max-h-[70vh]')}>
                                    <h2 className={cn('text-2xl font-bold mb-4')}>Quiz - {selectedQuizData.title}</h2>
                                    <p className={cn('mb-4')}>{selectedQuizData.description}</p>
                                    <div className={cn('mb-6')}>
                                        <h3 className={cn('text-lg font-semibold mb-2')}>Detalles del Examen:</h3>
                                        <ul className={cn('list-disc list-inside text-gray-700')}>
                                            <li>Número de Preguntas: {selectedQuizData.questions?.length} preguntas</li>
                                        </ul>
                                    </div>
                                    <div className={cn('flex flex-col mb-4 items-center w-full')}>
                                        <Button
                                            className={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                                            onClick={handleStartQuiz}
                                        >
                                            Empezar
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {quizState.started && selectedQuizData.questions && selectedQuizData.questions[quizState.currentQuestion] && !quizState.finished && (
                                <div className={cn('bg-gray-100 p-4 rounded-2xl mb-4')}>
                                    <h2 className={cn('text-2xl font-bold mb-4')}>Quiz - {selectedQuizData.title}</h2>
                                    <div className={cn('bg-gray-100 p-4 rounded-2xl mb-2')}> <StepProgress step={quizState.currentQuestion + 1} max={selectedQuizData.questions.length} label="Pregunta" /> </div>
                                    <div>
                                        <p className={cn('text-lg font-semibold mb-1')}>{quizState.currentQuestion + 1}. {selectedQuizData.questions[quizState.currentQuestion].title}</p>
                                        <p className={cn('text-sm text-gray-500 mb-4')}>Puntos: {selectedQuizData.questions[quizState.currentQuestion].points}</p>
                                        {selectedQuizData.questions[quizState.currentQuestion].type === 'multiple' && (
                                            <div className={cn('space-y-4')}>
                                                <div className={cn('flex justify-center')}>
                                                    <span className={cn('flex items-center')}>Selección multiple</span>
                                                </div>
                                                {selectedQuizData.questions[quizState.currentQuestion].options?.map((option, index) => {
                                                    const letter = String.fromCharCode(97 + index); // a=97
                                                    return (
                                                        <div key={index} className={cn('flex items-start mb-2')}>
                                                            <span className={cn('mr-2 font-semibold')}>{letter})</span>
                                                            <span className={cn('text-left')}>{option.value}</span>
                                                            {option.isCorrect && <span className={cn('ml-2 text-green-600 font-bold')}>Respuesta correcta</span>}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                        {selectedQuizData.questions[quizState.currentQuestion].type === 'text' && (
                                            <div className={cn('space-y-4')}>
                                                <div className={cn('flex justify-center')}>
                                                    <span className={cn('flex items-center')}>Pregunta abierta</span>
                                                </div>
                                                <div className={cn('w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-left')}>{selectedQuizData.questions[quizState.currentQuestion].options?.[0]?.value ?? ""}</div>
                                                {selectedQuizData.questions[quizState.currentQuestion].options?.[0]?.isCorrect && (
                                                    <span className={cn('ml-2 text-green-600 font-bold')}>Respuesta correcta</span>
                                                )}
                                            </div>
                                        )}
                                        <div className={cn('inline-flex mb-4 justify-center w-full gap-2 mt-4')}>
                                            {quizState.currentQuestion > 0 && (
                                                <Button
                                                    className={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                                                    onClick={handlePrevQuestion}
                                                >
                                                    Atrás
                                                </Button>
                                            )}
                                            <Button
                                                className={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                                                onClick={() => handleNextQuestion(selectedQuizData)}
                                            >
                                                {quizState.currentQuestion === (selectedQuizData.questions.length - 1) ? 'Finalizar' : 'Siguiente'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {quizState.finished && (
                                <div className={cn('bg-gray-100 p-6 rounded-3xl mb-4')}>
                                    <h2 className={cn('text-2xl font-bold mb-4')}>Quiz - {selectedQuizData.title}</h2>
                                    <div className={cn('flex flex-col items-center bg-gray-200 p-6 rounded-3xl mb-6')}>
                                        <div className={cn('rounded-2xl flex items-center justify-center w-[89px] h-[89px] bg-[#EBF9EE]')}>
                                            <div className={cn('rounded-2xl flex items-center justify-center w-[65px] h-[65px] bg-[#CEF4D7]')}>
                                                <CheckIcon width={60} height={60} className={cn('text-5xl text text-[#2A8940]')} />
                                            </div>
                                        </div>
                                        <p className={cn('mt-4 text-xl')}>Quiz finalizado. Puedes revisar las preguntas nuevamente o volver a intentar.</p>
                                        <div className={cn('inline-flex mb-4 justify-center w-full gap-2 mt-12')}>
                                            <Button
                                                className={cn('bg-[#0BBBE7] text-white text-lg px-8 py-2 rounded-2xl hover:bg-[#009fdf] transition-colors')}
                                                onClick={handleRetryQuiz}
                                            >
                                                Volver a intentar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span>Seleccione una clase o un quiz</span>
                    )}
                </div>

                {selectedClassData && selectedClassData.description ? (
                    <div className={cn("bg-white")}> 
                        <h4 className={cn("text-2xl font-semibold mb-2")}>{selectedClassData.title}</h4>
                        <div className={cn("mb-6 max-h-40 overflow-y-auto pr-2 rounded-md")}> 
                            <p className={cn("text-gray-700 whitespace-pre-line")}>{selectedClassData.description}</p>
                        </div>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>

            {/* Panel derecho: Tabs con descripción e instructor */}
            <div
                className={cn(
                    "border border-[#dde1e7] rounded-2xl p-6 shadow-md max-h-[70vh] overflow-y-auto",
                    "lg:w-1/4 w-full",
                    "hidden sm:block",
                    "lg:block lg:static lg:order-none",
                    "order-3 mt-4 lg:mt-0"
                )}
            >
                <Tabs defaultValue="description">
                    <TabsList className={cn("mb-4")}> 
                        <TabsTrigger value="description">Descripción</TabsTrigger>
                        <TabsTrigger value="instructor">Instructor</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className={cn("p-4")}> 
                        <p className={cn("text-gray-700")}>{data.description}</p>
                    </TabsContent>
                    <TabsContent value="instructor" className={cn("p-4 flex flex-col items-center")}> 
                        {data.instructorPhoto && (
                            <img 
                                src={typeof data.instructorPhoto === 'string' ? data.instructorPhoto : ''}
                                alt={data.instructorName}
                                className={cn("w-24 h-24 rounded-full object-cover mb-4 border-2 border-[#0BBBE7]")}
                            />
                        )}
                        <p className={cn("text-gray-700 text-center")}>{data.instructorName}</p>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Panel info para móviles: debajo y 100% ancho */}
            <div
                className={cn(
                    "border border-[#dde1e7] rounded-2xl p-4 shadow-md max-h-[40vh] overflow-y-auto",
                    "block sm:hidden w-full order-3 mt-4"
                )}
            >
                <Tabs defaultValue="description">
                    <TabsList className={cn("mb-4 w-full flex justify-center")}> 
                        <TabsTrigger value="description">Descripción</TabsTrigger>
                        <TabsTrigger value="instructor">Instructor</TabsTrigger>
                    </TabsList>
                    <TabsContent value="description" className={cn("p-2")}> 
                        <p className={cn("text-gray-700")}>{data.description}</p>
                    </TabsContent>
                    <TabsContent value="instructor" className={cn("p-2 flex flex-col items-center")}> 
                        {data.instructorPhoto && (
                            <img 
                                src={typeof data.instructorPhoto === 'string' ? data.instructorPhoto : ''}
                                alt={data.instructorName}
                                className={cn("w-20 h-20 rounded-full object-cover mb-2 border-2 border-[#0BBBE7]")}
                            />
                        )}
                        <p className={cn("text-gray-700 text-center text-sm")}>{data.instructorName}</p>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};