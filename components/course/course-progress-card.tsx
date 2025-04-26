import CircularProgress from '@/components/circular-progress-bar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image'
import { cn } from '@/lib/utils';
import { CoursePublicData, RemapedClass } from '@/utils/types';
import { useRouter } from 'next/navigation';

interface CourseProgressCardProps {
    course: CoursePublicData;
    index: number;
}

export function CourseProgressCard({ course, index }: CourseProgressCardProps) {
    const router = useRouter();

    const handleStartCourse = (course: CoursePublicData) => {
        router.push(`/courses/${course.canonicalId}/learn`);
    }

    return (
        <>
            <div
                key={index}
                className={cn(
                    "bg-white border border-gray-200 rounded-xl p-4 shadow-sm",
                    "h-full flex flex-col"
                )}
            >
                <div>
                    <span className="text-[#0BBBE7] text-sm font-medium mb-2 inline-block">
                        {course.category.name}
                    </span>
                    <h3 className="text-xl font-semibold mb-4">
                        {course.title}
                    </h3>
                </div>

                {/* Tarjeta interna con progreso */}
                <Card className={cn('mt-10 bg-[#F2F6FC] shadow-lg')}>
                    <CardContent>
                        <div className={cn('flex items-center space-x-4 mb-4')}>
                            <div className={cn("flex-1 mr-4")}>
                                {course.visibleClasses.map((cls: RemapedClass) => {
                                    // Determina si es la "actual" real en el contexto global
                                    // (idx + offset vs. currentIndex). Como 'visibleClasses' es un slice,
                                    // comprobamos si `cls.id` coincide con la 'currentIndex' global o algo similar.
                                    // Aquí haremos un check simplificado:
                                    const isCurrentGlobal = course.classesWithCompletion.findIndex((c) => c.id === cls.id) === course.currentIndex;

                                    return (
                                        <div key={cls.id} className={cn("flex items-center mb-2")}>
                                            <div className={cn("mr-2")}>
                                                {cls.completed ? (
                                                    <div className={cn("w-4 h-4 bg-[#0BBBE7] rounded-full flex items-center justify-center text-white text-xs")}>
                                                        ✓
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={cn(`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isCurrentGlobal ? 'border-[#0BBBE7]' : 'border-gray-300'
                                                            }`)}>
                                                        {isCurrentGlobal && (
                                                            <span className={cn("w-2 h-2 bg-[#0BBBE7] block rounded-full")} />
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className={cn(`text-md ${isCurrentGlobal ? 'font-semibold' : ''}`)}>
                                                {/* Dibuja la posición real en todo el curso */}
                                                <p className={cn(`text-xs`)}>Clase {course.classesWithCompletion.findIndex((c) => c.id === cls.id) + 1}</p>
                                                <p>{cls.title}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className={cn('flex justify-end m-6')}>
                                {/* Este div simula un gráfico circular del 80% */}
                                <CircularProgress progress={course.progressPercent} size={127} strokeWidth={15} withLegend={true} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Botón al fondo */}
                <div className={cn("flex justify-center items-center mt-6")}>
                    <Button type="button" onClick={() => handleStartCourse(course)}
                        className={cn('bg-[#0BBBE7] h-11 gap-6 text-white px-6 py-2 rounded-3xl hover:bg-[#009fdf] transition-colors')}>
                        Continuar
                    </Button>
                </div>
            </div>
        </>
    )
}


export function EmptyCourseProgressCard({ course, index }: CourseProgressCardProps) {
    const router = useRouter();

    const handleStartCourse = (course: CoursePublicData) => {
        router.push(`/courses/${course.canonicalId}/learn`);
    }
    return (
        <>
            <div className={cn(
                "bg-white border border-gray-200 rounded-xl p-4 shadow-sm",
                "h-full flex flex-col"
            )}>
                {/* Contenido superior */}
                <div className={cn("relative mb-4")}>
                    <Image src={course.courseImage} alt={`Curso ${index + 1}`} className={cn('w-full h-auto rounded-lg object-cover')} width={350} height={200} />
                    <div className={cn('absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full')}>
                        {course.courseDuration}
                    </div>
                </div>
                <span className={cn("text-[#0BBBE7] text-sm font-medium mb-2 inline-block")}>
                    {course.category.name}
                </span>
                <h3 className={cn("text-lg font-semibold mb-4")}>
                    {course.title}
                </h3>
                <p>
                    {course.description}
                </p>

                {/* Empuja el botón hacia abajo */}
                <div className={cn("flex justify-center items-center mt-6")}>
                    <Button
                        type="submit"
                        onClick={() => handleStartCourse(course)}
                        className={cn("bg-[#0BBBE7] text-white px-6 py-2 rounded-3xl hover:bg-[#009fdf] transition-colors")}
                    >
                        Empezar
                    </Button>
                </div>
            </div>
        </>
    );
}