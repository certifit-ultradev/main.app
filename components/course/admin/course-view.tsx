"use client"

import { CourseData } from '@/utils/types';
import { Suspense, useState } from 'react';
import { QuizView } from '../quiz-view';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type CourseViewProps = {
    data: CourseData
};

export const AdminCourseView = ({ data }: CourseViewProps) => {
    const [selectedClass, setSelectedClass] = useState<{ moduleIndex: number; classIndex: number } | null>(null);
    const [selectedQuiz, setSelectedQuiz] = useState<{ moduleIndex: number, quizId: number } | null>(null);

    const selectedClassData = selectedClass
        ? data.modules?.[selectedClass.moduleIndex]?.classes?.[selectedClass.classIndex]
        : null;

    const selectedQuizData = selectedQuiz ? data.modules?.[selectedQuiz.moduleIndex].quiz : null;

    return (
        <div className={cn('flex flex-col lg:flex-row w-full h-full p-6')}>
            <div className={cn('lg:w-1/4 w-full border border-[#CCD2DB] rounded-2xl p-4 mb-4 lg:mb-0')}>
                <h1 className={cn('text-2xl font-bold')}>{data.title}</h1>
                <p className={cn('text-gray-600 mb-6')}>{data.modules?.reduce((sum, module) => sum + (module.classes?.length || 0), 0)} clases</p>
                <div className={cn('space-y-4')}>
                    {data.modules?.map((module, moduleIndex) => (
                        <div key={moduleIndex}>
                            <h3 className={cn('font-semibold text-gray-700 mb-2')}>{module.title}</h3>
                            {module.classes?.map((cls, classIndex) => {
                                const isSelected =
                                    selectedClass &&
                                    selectedClass.moduleIndex === moduleIndex &&
                                    selectedClass.classIndex === classIndex;

                                return (
                                    <button
                                        key={classIndex}
                                        onClick={() => {
                                            setSelectedClass({ moduleIndex, classIndex });
                                            setSelectedQuiz(null);
                                        }}
                                        className={cn(`mb-5 block w-full text-left p-3 rounded-2xl ${isSelected ? 'bg-blue-100 border border-[#0BBBE7]' : 'bg-white border border-gray-300'
                                            }`)}
                                    >
                                        <span className={cn('text-[#575B62]')}>{`Clase ${classIndex + 1}`}</span><p className={cn('text-xl')}>{cls.title}</p>
                                    </button>
                                );
                            })}
                            {module.quiz && (
                                <button
                                    key={module.quiz.id}
                                    onClick={() => {
                                        setSelectedQuiz({ moduleIndex, quizId: module.quiz?.id ?? 0 });
                                        setSelectedClass(null);
                                    }} // Representa ver un quiz en vez de una clase
                                    className={cn(`block w-full text-left p-3 rounded-2xl ${selectedQuiz && selectedQuiz.moduleIndex === moduleIndex && selectedQuiz.quizId === module.quiz.id ? 'bg-[#E7F1FF] border border-[#0BBBE7]' : 'bg-white border border-gray-300'
                                        }`)}
                                >
                                    <span className={cn('text-[#575B62]')}>{`Quiz # ${moduleIndex + 1}`}</span><p className={cn('text-xl')}>{module.quiz.title}</p>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className={cn('lg:w-2/4 w-full lg:px-6')}>
                <div className={cn('bg-white p-6 rounded-md mb-6 shadow-md')}>
                    {selectedClassData && selectedClassData.video ? (
                        <div>
                            <Suspense>
                                <video controls className={cn('w-full rounded-md mb-4')}>
                                    <source
                                        src={typeof selectedClassData.video === 'string' ? selectedClassData.video: ""}
                                        type="video/mp4"
                                    />
                                    Tu navegador no soporta el formato de video
                                </video>

                                <h3 className={cn('text-2xl font-semibold mb-2')}>{selectedClassData.title}</h3>
                            </Suspense>
                        </div>
                    ) : selectedQuiz && selectedQuizData && selectedQuizData.id ? (<QuizView quiz={selectedQuizData} minRequiredPoints={data.modules?.[selectedQuiz.moduleIndex].minRequiredPoints ?? 0} onQuizFinish={() => { }} />) : (<span>Seleccione un curso o un quiz</span>)
                    }
                </div>

                {selectedClassData && selectedClassData.description ? (
                    <div className={cn('bg-white p-6 rounded-md shadow-md')}>
                        <h4 className={cn('text-lg font-semibold mb-4')}>Descripción de la clase</h4>
                        <div className={cn('mb-6')}>
                            <p className={cn('text-gray-700')}>{selectedClassData.description}</p>
                        </div>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>

            <div className={cn('lg:w-1/4 w-full bg-gray-50 rounded-md p-6 shadow-md')}>
                <div className={cn('w-full border border-[#CCD2DB] rounded-2xl p-4 mb-4 lg:mb-0')}>
                    <h4 className={cn('text-lg font-semibold mb-4')}>Descripción</h4>
                    <div className={cn('mb-6')}>
                        <p className={cn('text-gray-700')}>{data.description}</p>
                    </div>
                </div>
                <div className={cn('w-full border border-[#CCD2DB] rounded-2xl p-4 mb-4 lg:mb-0')}>
                    <h4 className={cn('text-xl font-semibold mb-4')}>Instructor</h4>
                    <div className={cn('mb-6')}>
                        <p className={cn('text-gray-700')}>{data.instructorName}</p>
                    </div>

                </div>
                <div className={cn('w-full border border-[#CCD2DB] rounded-2xl p-4 mb-4 lg:mb-0')}>
                    <h4 className={cn('text-xl font-semibold mb-4')}>Categoria</h4>
                    <div className={cn('mb-6')}>
                        <p className={cn('text-gray-700')}>{data.category?.name}</p>
                    </div>
                </div>
                <div className={cn('flex w-full border border-[#CCD2DB] rounded-2xl p-4 mb-4 lg:mb-0')}>
                    <h4 className={cn('text-xl font-semibold mb-4')}>Imagen del curso</h4>
                    <div className={cn('mb-6')}>
                        {data.courseImage ? (<Image
                            src={typeof data.courseImage === "string" ? data.courseImage : ""}
                            width={500}
                            height={400}
                            alt="Imagen"
                            className={cn('relative z-9 rounded-sm w-64 h-64 object-cover')}
                        />) : <p>cargando...</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}