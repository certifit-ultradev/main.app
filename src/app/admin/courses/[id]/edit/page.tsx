'use client';

import { NextPage } from 'next';
import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import { CourseCategoryData, CourseData } from '@/utils/types';
import { CourseStepProgress } from '@/components/course/progress-form';
import { CourseBasicForm } from '@/components/course/basic-form';
import { CourseClassesForm } from '@/components/course/classes-form';
import { CourseReviewForm } from '@/components/course/review-form';
import { useParams } from 'next/navigation'
import { getCourseDataById } from '@/actions/courses/list';
import _ from 'lodash';

const IndexEditCoursesPage: NextPage = () => {
    const initialCourseData = {
        title: '',
        price: 0.0,
        instructorName: '',
        category: { name: '' },
        description: '',
        expiresAt: '',
        courseImage: '',
        instructorPhoto: '',
        modules: [{
            title: '',
            minRequiredPoints: 0,
            classes: [{ title: '', description: '', videoDuration: 0, videoSize: 0 }],
            quiz: {
                title: '',
                description: '',
                questions: []
            }
        }]
    };

    const [step, setStep] = useState<number>(1);
    const [data, setData] = useState<CourseData>(initialCourseData);
    const originalData = useRef<CourseData>(_.cloneDeep(initialCourseData));
    const { id } = useParams();
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await getCourseDataById({ data: { id: Number(id) } });
                if (response.success && response.payload) {
                    setData(() => {
                        return {
                            id: response.payload?.id as number,
                            title: response.payload?.title as string,
                            price: response.payload?.price as number,
                            courseImage: response.payload?.courseImage as string,
                            instructorName: response.payload?.instructorName as string,
                            instructorPhoto: response.payload?.instructorPhoto as string,
                            category: response.payload?.category as CourseCategoryData,
                            description: response.payload?.description as string,
                            expiresAt: response.payload?.expiresAt as string,
                            modules: response.payload?.modules
                        }
                    });
                    originalData.current = _.cloneDeep(response.payload);
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.log(error.message);
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
                    <CourseReviewForm previousStep={previousStep} nextStep={nextStep} data={data} originalData={originalData.current} />
                )}
            </div>
        </div>
    );
};

export default IndexEditCoursesPage;