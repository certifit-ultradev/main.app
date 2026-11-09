"use client";

import type { StudentCourseDto } from "@/application/courses/student-course.dto";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, LockKeyhole } from "lucide-react";
import { ClientQuizView } from "./quiz-view";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { saveClassProgress, saveModuleCompletion } from '@/features/courses/learning/progress-http.client';
import { resolveLearningPosition } from '@/features/courses/learning/resume-position';

type CourseViewProps = {
    data: StudentCourseDto;
};

export const ClientCourseView = ({ data }: CourseViewProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const intervalRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedClass, setSelectedClass] = useState<{ moduleIndex: number; classIndex: number; classId: number } | null>(() => {
        const position = resolveLearningPosition(data);
        return position?.kind === 'class' ? position : null;
    });
    const [selectedQuiz, setSelectedQuiz] = useState<{ moduleIndex: number; moduleId: number; quizId: number } | null>(() => {
        const position = resolveLearningPosition(data);
        return position?.kind === 'quiz' ? position : null;
    });
    const [videoEnded, setVideoEnded] = useState(false);
    const [progressError, setProgressError] = useState<string | null>(null);
    const [failedModuleId, setFailedModuleId] = useState<number | null>(null);
    const [pendingNextModuleId, setPendingNextModuleId] = useState<number | null>(null);

    const router = useRouter();

    const selectedClassModule = selectedClass ? data.modules[selectedClass.moduleIndex] : null;
    const selectedClassData = selectedClassModule && !selectedClassModule.locked
        ? selectedClassModule.classes.find((lesson) => lesson.id === selectedClass?.classId)
        : null;
    const selectedQuizModule = selectedQuiz ? data.modules[selectedQuiz.moduleIndex] : null;
    const selectedQuizData = selectedQuizModule && !selectedQuizModule.locked && selectedQuizModule.quiz?.id === selectedQuiz?.quizId
        ? selectedQuizModule.quiz
        : null;

    useEffect(() => {
        if (pendingNextModuleId === null) return;
        const moduleIndex = data.modules.findIndex((module) => module.id === pendingNextModuleId);
        const nextModule = data.modules[moduleIndex];
        if (!nextModule || nextModule.locked) return;
        const firstClass = nextModule.classes[0];
        if (firstClass) {
            setSelectedClass({ moduleIndex, classIndex: 0, classId: firstClass.id });
            setSelectedQuiz(null);
        } else if (nextModule.quiz) {
            setSelectedQuiz({ moduleIndex, moduleId: nextModule.id, quizId: nextModule.quiz.id });
            setSelectedClass(null);
        }
        setPendingNextModuleId(null);
    }, [data.modules, pendingNextModuleId]);

    useEffect(() => {
        if (selectedClass) {
            const elementId = `class-${selectedClass.moduleIndex}-${selectedClass.classIndex}`;
            const el = document.getElementById(elementId);
            if (el) {
                // Desplazamiento suave y centrado
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }
    }, [selectedClass]);

    // Función para enviar el estado de reproducción
    const persistClassState = async (classId: number, currentTime: number, isCompleted = false): Promise<boolean> => {
        setProgressError(null);
        try {
            await saveClassProgress({
                canonicalId: data.canonicalId,
                classId,
                isCompleted,
                currentTime,
            });
            router.refresh();
            return true;
        } catch {
            setProgressError('No se pudo guardar el progreso de la clase. Inténtalo nuevamente.');
            return false;
        }
    };

    const storeClassState = (currentTime: number, isCompleted = false): Promise<boolean> =>
        selectedClass ? persistClassState(selectedClass.classId, currentTime, isCompleted) : Promise.resolve(false);

    // Inicia un intervalo que cada 3 segundos envía el estado del video
    const handleVideoPlay = () => {
        // Si el video ya terminó y se muestra el overlay, no reestablecemos el intervalo
        if (videoEnded) return;
        if (!intervalRef.current && videoRef.current) {
            intervalRef.current = window.setInterval(() => {
                if (videoRef.current && !videoRef.current.paused) {
                    void storeClassState(videoRef.current.currentTime, false);
                }
            }, 2300);
        }
    };

    // Limpia el intervalo al pausar o finalizar
    const clearVideoInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Cuando finaliza el video, limpia el intervalo, envía el estado completado y muestra el overlay
    const handleVideoEnd = (e: React.SyntheticEvent<HTMLVideoElement>) => {
        clearVideoInterval();
        void storeClassState(e.currentTarget.currentTime, true).then((saved) => {
            if (saved) setVideoEnded(true);
        });
    };

    const handleVideoPause = () => {
        clearVideoInterval();
    };

    // Seek only after metadata is available; loadstart may be too early for the browser.
    const handleLoadedMetadata = (event: React.SyntheticEvent<HTMLVideoElement>) => {
        const saved = data.classCompleted.find((state) => state.classId === selectedClassData?.id)?.currentVideoTime;
        if (saved === undefined) return;
        const duration = event.currentTarget.duration;
        event.currentTarget.currentTime = Number.isFinite(duration) && duration > 0
            ? Math.min(Math.max(0, saved), duration)
            : Math.max(0, saved);
    };

    // Función para que el usuario pueda "reproducir de nuevo" el video (resetear)
    const handleRewatch = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
            setVideoEnded(false);
        }
    };

    // Función para avanzar a la siguiente clase o, si es la última, seleccionar el quiz
    const handleNext = () => {
        if (!selectedClass) return;
        const moduleIndex = selectedClass.moduleIndex;
        const currentClassIndex = selectedClass.classIndex;
        const currentModule = data.modules?.[moduleIndex];
        if (!currentModule) return;
        const totalClasses = currentModule.classes.length;
        if (currentClassIndex < totalClasses - 1) {
            // Existe siguiente clase en el módulo
            const nextClass = currentModule.classes[currentClassIndex + 1];
            if (!nextClass) return;
            setSelectedClass({
                moduleIndex,
                classIndex: currentClassIndex + 1,
                classId: nextClass.id,
            });
            setSelectedQuiz(null);
        } else {
            // Última clase: pasar al quiz si existe
            if (currentModule.quiz) {
                setSelectedQuiz({
                    moduleIndex,
                    moduleId: currentModule.id,
                    quizId: currentModule.quiz.id,
                });
                setSelectedClass(null);
            }
        }
        setVideoEnded(false);
    };

    const storeModuleComplete = async (): Promise<void> => {
        if (!selectedQuiz) return;
        const currentModuleId = selectedQuiz.moduleId;
        setProgressError(null);
        setFailedModuleId(null);
        try {
            await saveModuleCompletion({ canonicalId: data.canonicalId, moduleId: currentModuleId });
            router.refresh();
            const moduleIndex = data.modules.findIndex((module) => module.id === currentModuleId);
            const nextModule = moduleIndex >= 0 ? data.modules[moduleIndex + 1] : undefined;
            if (nextModule) setPendingNextModuleId(nextModule.id);
        } catch {
            setFailedModuleId(currentModuleId);
            setProgressError('No se pudo guardar la finalización del módulo. Inténtalo nuevamente.');
        }
    }


    return (
        <>
            <div className={cn("flex flex-col lg:flex-row w-full h-full p-6")}>
                {/* Panel izquierdo: listado de módulos y clases */}
                <div className={cn("lg:w-1/4 w-full border border-[#CCD2DB] rounded-2xl p-4 mb-4 lg:mb-0 overflow-y-auto max-h-[70vh]")} ref={containerRef}>
                    <h1 className={cn("text-2xl font-bold")}>{data.title}</h1>
                    <p className={cn("text-gray-600 mb-6")}>
                        {data.modules?.reduce((sum, module) => sum + (module.classes?.length || 0), 0)} clases
                    </p>
                    <div className={cn("space-y-4")} id="course-items-container">
                        {data.modules?.map((module, moduleIndex) => {
                            const isQuizCompleted = data.quizCompleted.find(
                                (quizCompleted) => quizCompleted.quizId === module.quiz?.id && quizCompleted.passed
                            );
                            return (
                                <div key={module.id}>
                                    <h3 className={cn("font-semibold text-gray-700 mb-2")}>
                                        Módulo #{moduleIndex + 1} {module.title}
                                    </h3>
                                    {module.locked && (
                                        <p className="flex items-center gap-2 text-sm text-gray-500 mb-3" aria-label={`Módulo ${moduleIndex + 1} bloqueado`}>
                                            <LockKeyhole className="w-4 h-4" aria-hidden="true" />
                                            Aprueba el quiz del módulo anterior para continuar.
                                        </p>
                                    )}
                                    {module.classes?.map((cls, classIndex) => {
                                        const isSelected =
                                            selectedClass &&
                                            selectedClass.moduleIndex === moduleIndex &&
                                            selectedClass.classIndex === classIndex;
                                        const isCompleted = data.classCompleted.find(
                                            (clsCompleted) => clsCompleted.classId === cls.id && clsCompleted.isCompleted
                                        );
                                        return (
                                            <div key={cls.id} className={cn("mb-4")}>
                                                <button
                                                    id={`class-${moduleIndex}-${classIndex}`}
                                                    onClick={() => {
                                                        if (selectedClass?.classId !== cls.id) {
                                                            const savedTime = data.classCompleted.find((state) => state.classId === cls.id)?.currentVideoTime ?? 0;
                                                            void persistClassState(cls.id, savedTime);
                                                        }
                                                        setSelectedClass({ moduleIndex, classIndex, classId: cls.id });
                                                        setVideoEnded(false);
                                                        setSelectedQuiz(null);
                                                    }}
                                                    className={cn(
                                                        "relative flex items-center gap-3 w-full p-3 rounded-2xl text-left transition-colors",
                                                        isSelected ? "bg-blue-100 border border-[#0BBBE7]" : "bg-white border border-gray-300"
                                                    )}
                                                >
                                                    <div className={cn("flex-shrink-0")}>
                                                        {isCompleted ? (
                                                            <div className={cn("w-5 h-5 rounded-full flex items-center justify-center bg-[#0BBBE7]")}>
                                                                <Check className={cn("text-white w-4 h-4")} />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                className={cn(
                                                                    "w-5 h-5 rounded-full border flex items-center justify-center",
                                                                    isSelected ? "border-[#0BBBE7]" : "border-gray-300"
                                                                )}
                                                            />
                                                        )}
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
                                                if (!module.quiz) return;
                                                setSelectedQuiz({ moduleIndex, moduleId: module.id, quizId: module.quiz.id });
                                                setSelectedClass(null);
                                                setVideoEnded(false);
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
                                            {isQuizCompleted ? (
                                                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center bg-[#0BBBE7]")}>
                                                    <Check className={cn("text-white w-4 h-4")} />
                                                </div>
                                            ) : (
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
                                            )}
                                            <span className={cn("text-[#575B62] ml-2")}>{`Quiz # ${moduleIndex + 1}`}</span>
                                            <p className={cn("text-xl")}>{module.quiz.title}</p>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Panel central: reproductor de video o quiz */}
                <div className={cn("lg:w-2/4 w-full xl:px-6")}>
                    {progressError && <p role="alert" className="mb-3 text-sm text-red-600">{progressError}</p>}
                    {selectedQuiz && failedModuleId === selectedQuiz.moduleId && (
                        <button type="button" onClick={() => void storeModuleComplete()} className="mb-3 text-sm text-blue-700 underline">
                            Reintentar guardar módulo
                        </button>
                    )}
                    <div className={cn("relative bg-white")}>
                        {selectedClassData && selectedClassData.video ? (
                            <div className="relative">
                                <video
                                    autoPlay
                                    controls
                                    src={`${selectedClassData.video}`}
                                    ref={videoRef}
                                    onPlay={handleVideoPlay}
                                    onPause={handleVideoPause}
                                    onEnded={handleVideoEnd}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    className={cn("w-full rounded-xl mb-4")}
                                />
                                {/* Overlay que cubre sólo el reproductor */}
                                {videoEnded && (
                                    <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center z-10">
                                        <p className="text-white text-2xl mb-4">¡Video finalizado!</p>
                                        <div className="flex gap-4">
                                            <Button
                                                onClick={handleRewatch}
                                                className={cn("px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors")}
                                            >
                                                Reproducir de nuevo
                                            </Button>
                                            <Button
                                                onClick={handleNext}
                                                className={cn("px-6 py-3 bg-[#0BBBE7] text-black font-semibold rounded-full hover:bg-[#009fdf] transition-colors")}
                                            >
                                                Siguiente
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : selectedQuizData && selectedQuizData.id ? (
                            <ClientQuizView
                                quiz={selectedQuizData}
                                quizIndex={selectedQuiz?.moduleIndex ?? 0}
                                // lastResult={data.quizCompleted.find((quizCompleted) => quizCompleted.quizId === selectedQuizData.id)}
                                courseCanonicalId={data.canonicalId}
                                minRequiredPoints={selectedQuiz ? data.modules[selectedQuiz.moduleIndex]?.minRequiredPoints ?? 0 : 0}
                                onQuizFinish={(moduleIndex: number, passed: boolean) => {
                                    if (passed) {
                                        // Lógica para almacenar el estado del módulo
                                        void storeModuleComplete();
                                    }
                                }}
                            />
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
                <div className={cn("lg:w-1/4 w-full border border-[#dde1e7] rounded-2xl p-6 shadow-md max-h-[70vh] overflow-y-auto")}>
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
                                <Image
                                    width={120} height={120}
                                    src={typeof data.instructorPhoto === 'string' ? data.instructorPhoto : ''}
                                    alt={data.instructorName}
                                    className={cn("w-24 h-24 rounded-full object-cover mb-4 border-2 border-[#0BBBE7]")}
                                />
                            )}
                            <p className={cn("text-gray-700 text-center")}>{data.instructorName}</p>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};
