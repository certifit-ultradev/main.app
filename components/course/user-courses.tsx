'use client'

import { cn } from '@/lib/utils';
import { CoursePublicData } from '@/utils/types';
import { useEffect, useState } from 'react';
import { CourseProgressCard, EmptyCourseProgressCard } from './course-progress-card';
import { Loading } from './loading';

export const UserCourses = () => {
    const [courses, setCourses] = useState<CoursePublicData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await fetch('/api/courses');
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

    return (
        <div className={cn("max-h-[75vh] overflow-y-auto")}>
            <div className={cn('grid grid-cols-1 md:grid-cols-3 auto-rows-min gap-6 ')}>
                { isLoading ? (<Loading/>) : courses.map((course, index) => {
                    const cardComponent: JSX.Element = course.progressPercent === 0 ? <EmptyCourseProgressCard course={course} index={index} /> : <CourseProgressCard course={course} index={index} />;
                    return (
                        <div key={index}>
                            {cardComponent}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}