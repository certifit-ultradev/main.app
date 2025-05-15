"use client"

import { cn } from "@/lib/utils";
import { CoursePlainData } from "@/utils/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from 'next/navigation';
import Modal from "../modal";
import { ArrowTopLeftIcon } from "../svg/certifit-icons";
import CertifitCheckoutComponent from "../certifit-checkout";
import { Loading } from "./loading";

export const TopThreeCourses = () => {
    const [courses, setCourses] = useState<CoursePlainData[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState<CoursePlainData>({
        id: 0,
        canonicalId: '',
        title: '',
        price: 0,
        courseImage: '',
        instructorName: '',
        instructorPhoto: '',
        courseDuration: '',
        alreadyPurchased: false,
        category: {
            id: 0,
            name: ''
        },
        description: '',
        expiresAt: new Date,
    });
    const router = useRouter();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/courses/top-three');
                const activeCourses = await response.json();
                // Asigna cursos
               setCourses(activeCourses);
            } catch (error) {
                console.error(error);
            } finally {
                // Quita el loading
               setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleModalClose = () => {
        setIsOpen(false);
    };

    const handleBuyCourse = (course: CoursePlainData) => {
        setIsOpen(true);
        setSelectedCourse(course);
    }

    const handleStartCourse = (course: CoursePlainData) => {
        router.push(`/courses/${course.canonicalId}/learn`);
    }

    return (
        <>
            <div className={cn(
                "relative flex overflow-x-auto snap-x snap-mandatory gap-4",
                "md:grid md:grid-cols-3 md:gap-8 md:overflow-hidden"
            )}>
                {isLoading ? (<Loading/>) : courses.map((course, index) => (
                    <div key={index} className={cn(
                        "bg-white rounded-xl snap-center flex-shrink-0 w-full sm:w-auto border",
                        "text-center px-4 py-2"
                    )} style={{ scrollSnapAlign: "center" }}>
                        <div className={cn('relative mb-4')}>
                            <Image src={course.courseImage} alt={`Curso ${index + 1}`} className={cn('w-full h-full rounded-lg')} width={310} height={212} />
                            <div className={cn('absolute top-2 right-2 bg-[#ababab] bg-opacity-60 text-white text-xs px-2 py-1 rounded-full')}>
                                {course.courseDuration}
                            </div>
                        </div>
                        <span className={cn('text-[#0BBBE7] text-xs font-medium block mb-1')}>{course.category?.name}</span>
                        <div className={cn('flex items-center justify-between')}>
                            <h3 className={cn('text-lg font-semibold text-black flex ')}>
                                {course.title}
                            </h3>
                            {!course.alreadyPurchased ? (<Button onClick={() => {
                                setIsOpen(true);
                                setSelectedCourse(course);
                            }} className={cn('text-white border-none shadow-none text-base')}> <ArrowTopLeftIcon className={cn('text-white')} width={10} height={10} /></Button>) : <></>}
                        </div>
                        <p className={cn('text-gray-400 text-sm mt-2 mb-4 leading-relaxed')}>
                            {course.description.substring(0, 30)}...
                        </p>
                        <div className={cn('flex items-center justify-between text-sm flex-col space-x-3 lg:flex-row')}>
                            <div className={cn('flex items-center space-x-2')}>
                                <Image src={course.instructorPhoto} alt="Instructor" className={cn('w-6 h-6 rounded-full')} width={40} height={40} />
                                <div className={cn('items-center justify-between text-sm')}>
                                    <p className={cn('text-[#101828] font-bold')}>{course.instructorName}</p>
                                    <p className={cn('text-gray-500 text-xs')}>Entrenador</p>
                                </div>
                            </div>
                            {!course.alreadyPurchased ? (<span className={cn('text-[#0BBBE7] font-semibold')}>${course.price}</span>) : (<Button onClick={() => course.alreadyPurchased ? handleStartCourse(course) : handleBuyCourse(course)} className={cn('mt-6 lg:mt-0 px-6 py-3 bg-[#0BBBE7] hover:bg-[#009fdf] font-semibold rounded-full transition-colors text-white')}> Ver curso</Button>)}
                        </div>
                    </div>
                ))}
            </div>
            <div>
                <ModalCourseDetail course={selectedCourse} isOpen={isOpen} setOpen={handleModalClose} />
            </div>
        </>
    );
}

type ModalCourseDetailProp = {
    course: CoursePlainData
    isOpen: boolean;
    setOpen: () => void;
}

const ModalCourseDetail = ({ course, isOpen, setOpen }: ModalCourseDetailProp) => {
    return (
        <Modal open={isOpen} setOpen={setOpen} closeButton={false}>
            <div className={cn("relative z-10")}>
                <div
                    className={cn(
                        "inline-block align-bottom bg-white rounded-lg text-left",
                        "overflow-hidden shadow-xl transform transition-all",
                        "sm:align-middle sm:max-w-lg w-full"
                    )}
                >
                    <div className={cn("bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4")}>
                        <div
                            className={cn(
                                "sm:flex sm:items-start sm:justify-between mb-4"
                            )}
                        >
                            <div>
                                <h2 className={cn("text-xl font-semibold text-gray-800")}>
                                    {course.title}
                                </h2>
                                <p className={cn("text-sm text-[#0BBBE7]")}>
                                    {course.category?.name}
                                </p>
                            </div>
                        </div>

                        {course.courseImage && (
                            <div className={cn("mb-4")}>
                                <Image
                                    src={course.courseImage}
                                    alt={course.title}
                                    width={500}
                                    height={300}
                                    className={cn("w-full h-auto rounded-md object-cover")}
                                />
                            </div>
                        )}

                        <div className={cn("space-y-2 text-sm text-gray-700")}>
                            <p className={cn("font-medium")}>
                                Instructor: {course.instructorName}
                            </p>
                            <p>
                                Duración: {course.courseDuration}
                            </p>
                            <p>
                                Precio: <span className={cn("font-semibold")}>${course.price}</span>
                            </p>
                            <p>{course.description}</p>
                        </div>
                    </div>

                    <div className={cn("bg-gray-50 px-4 py-3 sm:px-6 flex justify-end")}>
                        <CertifitCheckoutComponent
                            courseCanonicalId={course.canonicalId}
                            closeCheckout={setOpen}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}

