'use client';

import type { CourseEditorFormValues } from '@/features/courses/editor/course-editor-form.types';
import { calculateEditorVideoDuration, calculateEditorVideoSize, formatEditorVideoDuration, formatEditorVideoSize } from '@/features/courses/editor/client/course-video-metrics';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type Props = { data: CourseEditorFormValues; isActive: boolean; previousStep: () => void };

/** Step three reviews the content already persisted by the prior steps. */
export const CourseReviewForm = ({ data, isActive, previousStep }: Props) => {
    const router = useRouter();
    return (
        <section className="w-full lg:w-3/4 space-y-5 rounded-md border border-gray-300 p-6">
            <h1 className="text-xl font-semibold">Resumen del curso</h1>
            <p className="text-sm text-gray-600">{isActive
                ? 'Los cambios ya están guardados en el curso activo.'
                : 'Los datos ya están guardados. El curso permanece inactivo hasta que lo actives desde la administración.'}</p>
            <dl className="space-y-2">
                <div><dt className="inline font-medium">Nombre: </dt><dd className="inline">{data.title}</dd></div>
                <div><dt className="inline font-medium">Precio: </dt><dd className="inline">${data.price}</dd></div>
                <div><dt className="inline font-medium">Instructor: </dt><dd className="inline">{data.instructorName}</dd></div>
                <div><dt className="inline font-medium">Categoría: </dt><dd className="inline">{data.category?.name}</dd></div>
                <div><dt className="inline font-medium">Vencimiento: </dt><dd className="inline">{data.expiresAt.slice(0, 10)}</dd></div>
                <div><dt className="inline font-medium">Peso de videos: </dt><dd className="inline">{formatEditorVideoSize(calculateEditorVideoSize(data.modules))} GB</dd></div>
                <div><dt className="inline font-medium">Duración: </dt><dd className="inline">{formatEditorVideoDuration(calculateEditorVideoDuration(data.modules))}</dd></div>
            </dl>
            <p>{data.description}</p>
            <div className="flex gap-6 text-sm">
                <span>{data.modules.length} módulos</span>
                <span>{data.modules.reduce((sum, module) => sum + module.classes.length, 0)} clases</span>
                <span>{data.modules.filter((module) => module.quiz.questions.length > 0).length} evaluaciones</span>
            </div>
            <div className="flex justify-between pt-4">
                <Button type="button" variant="outline" onClick={previousStep}>Atrás</Button>
                <Button type="button" onClick={() => router.push('/admin')}>Finalizar</Button>
            </div>
        </section>
    );
};
