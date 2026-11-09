'use client'

import { cn } from '@/lib/utils';
import type { StudentCourseListItemDto } from '@/application/courses/student-course.dto';
import { useEffect, useState, type JSX } from 'react';
import { CourseProgressCard, EmptyCourseProgressCard } from './course-progress-card';
import { Loading } from './loading';
import { getUserCourseList } from '@/features/courses/learning/course-api.client';

export const UserCourses = () => {
    const [courses, setCourses] = useState<StudentCourseListItemDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setCourses(await getUserCourseList());
            } catch {
                setCourses([]);
            } finally {
                // Quita el loading
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const coursesElements = courses.map((course, index) => {
        const cardComponent: JSX.Element = course.progressPercent === 0
            ? <EmptyCourseProgressCard course={course} position={index} />
            : <CourseProgressCard course={course} />;
        return (
            <div key={course.canonicalId}>
                {cardComponent}
            </div>
        )
    });

    return (
        <div className={cn("max-h-[75vh] overflow-y-auto")}>
            <div className={cn('grid grid-cols-1 md:grid-cols-3 auto-rows-min gap-6')}>
                {isLoading ? (<Loading />) : coursesElements.length > 0 ? coursesElements : EmptyCourse()}
            </div>
        </div>
    );
}

const EmptyCourse = () => {
    return (
        <div className={cn('flex col-start-2 justify-center')}>
            <p className={cn('text-gray-500')}>No tienes cursos todavía</p>
        </div>
    );
}
