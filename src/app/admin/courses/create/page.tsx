"use client";

import { NextPage } from "next";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { CourseData } from "@/utils/types";
import { CourseStepProgress } from "@/components/course/progress-form";
import { CourseBasicForm } from "@/components/course/basic-form";
import { CourseClassesForm } from "@/components/course/classes-form";
import { CourseReviewForm } from "@/components/course/review-form";

const CreateCoursesPage: NextPage = () => {
    const [step, setStep] = useState<number>(1);
    const [data, setData] = useState<CourseData>({
        title: '',
        price: 0.0,
        courseImage: null,
        instructorName: '',
        instructorPhoto: null,
        category: { name: '' },
        description: '',
        expiresAt: '',
        modules: [{ title: '', minRequiredPoints: 0, classes: [{ title: '', description: '', videoSize:0, videoDuration:0 }], quiz: { title: '', description: '', questions: [] } }]
    });

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

export default CreateCoursesPage;