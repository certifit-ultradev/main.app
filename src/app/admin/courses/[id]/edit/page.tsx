'use client';

import { NextPage } from 'next';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import type { CourseEditorFormValues } from '@/features/courses/editor/course-editor-form.types';
import { toCourseEditorFormValues } from '@/features/courses/editor/course-editor-form.mapper';
import { CourseStepProgress } from '@/components/course/progress-form';
import { CourseBasicForm } from '@/components/course/basic-form';
import { CourseClassesForm } from '@/components/course/classes-form';
import { CourseReviewForm } from '@/components/course/review-form';
import { useParams } from 'next/navigation'
import { getCourseDataById } from '@/actions/courses/list';

const IndexEditCoursesPage: NextPage = () => {
    const initialCourseData: CourseEditorFormValues = {
        title: '',
        price: 0.0,
        instructorName: '',
        category: null,
        description: '',
        expiresAt: '',
        courseImage: '',
        instructorPhoto: '',
        modules: [{
            title: '',
            minRequiredPoints: 0,
            classes: [{ title: '', description: '', video: null, videoDuration: 0, videoSize: 0 }],
            quiz: {
                title: '',
                description: '',
                questions: []
            }
        }]
    };

    const [step, setStep] = useState<number>(1);
    const [data, setData] = useState<CourseEditorFormValues>(initialCourseData);
    const { id } = useParams();

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await getCourseDataById({ id: Number(id) });
                if (response.ok) {
                    const editorFormData = toCourseEditorFormValues(response.data);
                    setData(editorFormData);
                }
            } catch (error) {
                if (error instanceof Error) {
                    // notFound();
                }
            }
        }
        fetchCourse();
    }, [id]);

    const nextStep = () => setStep(step + 1);
    const previousStep = () => setStep(step - 1);

    return (
        <div className={cn('mt-10 items-center justify-center')}>
            <div className={cn('flex flex-col lg:flex-row gap-8 p-6 mx-auto w-full max-w-lg min-w-0 md:min-w-[50rem] lg:min-w-[110rem]')}>
                <CourseStepProgress currentStep={step} />
                {step === 1 && (
                    <CourseBasicForm nextStep={nextStep} setData={setData} data={data} />
                )}
                {step === 2 && (
                    <CourseClassesForm previousStep={previousStep} nextStep={nextStep} setData={setData} data={data} />
                )}
                {step === 3 && (
                    <CourseReviewForm previousStep={previousStep} nextStep={nextStep} data={data} />
                )}
            </div>
        </div>
    );
};

export default IndexEditCoursesPage;
