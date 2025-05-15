"use client";

import { CoursePublicData } from "@/utils/types";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { ClientQuizView } from "./quiz-view";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

type CourseViewProps = {
    data: CoursePublicData;
};

export const ClientCourseView = ({ data }: CourseViewProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const intervalRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null)
    const [selectedClass, setSelectedClass] = useState<{ moduleIndex: number; classIndex: number; classId: number|undefined } | null>(() => {
        if (data.classCompleted.length === 0) return null
    
        const lastId = data.classCompleted[data.classCompleted.length - 1].classId
    
        for (let m = 0; m < data.modules!.length; m++) {
          const mod = data.modules![m]
          const idx = mod.classes?.findIndex((cls) => cls.id === lastId)
          if (idx != null && idx >= 0) {
            return { moduleIndex: m, classIndex: idx, classId: lastId }
          }
        }
        return null
      });
    const [selectedQuiz, setSelectedQuiz] = useState<{ moduleIndex: number; moduleId: number; quizId: number } | null>(null);
    const [videoEnded, setVideoEnded] = useState(false);

    const router = useRouter();

    const selectedClassData = selectedClass
        ? data.modules?.[selectedClass.moduleIndex]?.classes?.[selectedClass.classIndex]
        : null;
    const selectedQuizData = selectedQuiz ? data.modules?.[selectedQuiz.moduleIndex!].quiz : null;

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
    const storeClassState = (currentTime: number, isCompleted = false) => {
        fetch(`/api/courses/class-state`, {
            method: "POST",
            body: JSON.stringify({
                canonicalId: data.canonicalId,
                classId: selectedClass?.classId,
                isCompleted,
                currentTime,
            }),
        }).then(async (response) => {
            const result = await response.json();
            if (!result.success) {
                console.log("error, intente mas tarde");
                return;
            }
            router.refresh();
        });
    };

    // Inicia un intervalo que cada 3 segundos envía el estado del video
    const handleVideoPlay = () => {
        // Si el video ya terminó y se muestra el overlay, no reestablecemos el intervalo
        if (videoEnded) return;
        if (!intervalRef.current && videoRef.current) {
            intervalRef.current = window.setInterval(() => {
                if (videoRef.current && !videoRef.current.paused) {
                    storeClassState(videoRef.current.currentTime, false);
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
        storeClassState(e.currentTarget.currentTime, true);
        setVideoEnded(true);
    };

    const handleVideoPause = () => {
        clearVideoInterval();
    };

    // Al cargar el video, establece el currentTime según el estado previo
    const handleLoadStart = () => {
        if (videoRef.current) {
            const clsCurrentTime = data.classCompleted.find((clsCompleted) => clsCompleted.classId === selectedClassData?.id);
            videoRef.current.currentTime = clsCurrentTime?.currentVideoTime ?? 0;
        }
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
        const totalClasses = currentModule.classes?.length || 0;
        if (currentClassIndex < totalClasses - 1) {
            // Existe siguiente clase en el módulo
            setSelectedClass({
                moduleIndex,
                classIndex: currentClassIndex + 1,
                classId: currentModule.classes?.[currentClassIndex + 1].id,
            });
            setSelectedQuiz(null);
        } else {
            // Última clase: pasar al quiz si existe
            if (currentModule.quiz) {
                setSelectedQuiz({
                    moduleIndex,
                    moduleId: currentModule.id ?? 0,
                    quizId: currentModule.quiz.id ?? 0,
                });
                setSelectedClass(null);
            }
        }
        setVideoEnded(false);
    };

    const storeModuleComplete = () => {
        const currentModuleId = selectedQuiz?.moduleId;
        fetch(`/api/courses/module-state`, {
            method: 'POST', body: JSON.stringify({
                canonicalId: data.canonicalId, moduleId: currentModuleId
            })
        }).then(async (response) => {
            const result = await response.json();
            if (!result.success) {
                console.log("error, intent mas tarde");
                return;
            }
            const moduleIndex = data.modules!.findIndex((module) => module.id === currentModuleId)
            if (data.modules!.length - 1 > moduleIndex!) {
                setSelectedClass({ moduleIndex: moduleIndex! + 1, classIndex: 0, classId: data.modules![moduleIndex].classes![0].id });
                setSelectedQuiz(null);
            } else {
                console.log("acabaste");
            }
        });
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
                            const isModuleCompleted = data.moduleCompleted.find(
                                (moduleCompleted) => moduleCompleted.moduleId === module.id && moduleCompleted.isCompleted
                            );
                            const isQuizCompleted = data.quizCompleted.find(
                                (quizCompleted) => quizCompleted.quizId === module.quiz?.id
                            );
                            return (
                                <div key={moduleIndex}>
                                    <h3 className={cn("font-semibold text-gray-700 mb-2")}>
                                        Módulo #{moduleIndex + 1} {module.title}
                                    </h3>
                                    {module.classes?.map((cls, classIndex) => {
                                        const isSelected =
                                            selectedClass &&
                                            selectedClass.moduleIndex === moduleIndex &&
                                            selectedClass.classIndex === classIndex;
                                        const isCompleted = data.classCompleted.find(
                                            (clsCompleted) => clsCompleted.classId === cls.id && clsCompleted.isCompleted
                                        );
                                        return (
                                            <div key={classIndex} className={cn("mb-4")}>
                                                <button
                                                    id={`class-${moduleIndex}-${classIndex}`}
                                                    onClick={() => {
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
                                                setSelectedQuiz({ moduleIndex, moduleId: module.id ?? 0, quizId: module.quiz?.id ?? 0 });
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
                                            {isModuleCompleted || isQuizCompleted ? (
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
                                    onLoadStart={handleLoadStart}
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
                                minRequiredPoints={data.modules?.[selectedQuiz?.moduleIndex ?? 0].minRequiredPoints ?? 0}
                                onQuizFinish={(moduleIndex: number, passed: boolean) => {
                                    if (passed) {
                                        // Lógica para almacenar el estado del módulo
                                        storeModuleComplete();
                                    }
                                }}
                            />
                        ) : (
                            <span>Seleccione una clase o un quiz</span>
                        )}
                    </div>

                    {selectedClassData && selectedClassData.description ? (
                        <div className={cn("bg-white p-6")}>
                            <h4 className={cn("text-2xl font-semibold mb-2")}>{selectedClassData.title}</h4>
                            <div className={cn("mb-6")}>
                                <p className={cn("text-gray-700")}>{selectedClassData.description}</p>
                            </div>
                        </div>
                    ) : (
                        <div></div>
                    )}
                </div>

                {/* Panel derecho: Tabs con descripción e instructor */}
                <div className={cn("lg:w-1/4 w-full border border-[#dde1e7] rounded-2xl p-6 shadow-md")}>
                    <Tabs defaultValue="description">
                        <TabsList className={cn("mb-4")}>
                            <TabsTrigger value="description">Descripción</TabsTrigger>
                            <TabsTrigger value="instructor">Instructor</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description" className={cn("p-4")}>
                            <p className={cn("text-gray-700")}>{data.description}</p>
                        </TabsContent>
                        <TabsContent value="instructor" className={cn("p-4")}>
                            <p className={cn("text-gray-700")}>{data.instructorName}</p>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};
