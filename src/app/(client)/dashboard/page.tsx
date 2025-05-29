import { TopThreeCourses } from '@/components/course/top-courses';
import { UserCourses } from '@/components/course/user-courses';
import WompiProvider from '@/components/wompi-provider';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';
import Loading from './loading';
import { NextPage } from 'next';

const DashboardPage: NextPage = async ({ }) => {
    return (
        <section id="dashboard" className={cn('text-white py-16 px-4 sm:px-6 lg:px-8')}>

            <div className={cn('bg-white text-black')}>
                <div className={cn('max-w-7xl mx-auto')}>
                    <h5 className={cn('sm:text-4xl font-bold mb-4 text-black text-left')}>Mis cursos</h5>
                    <div>
                        <Suspense fallback={<Loading />}>
                            <UserCourses />
                        </Suspense>
                    </div>
                </div>
                <WompiProvider>
                    <section id="top-courses" className={cn('text-white py-16 px-4 sm:px-6 lg:px-8')}>
                        <div className={cn('max-w-7xl mx-auto')}>
                            <h5 className={cn('sm:text-4xl font-bold mb-4 text-black text-left')}>Explorar</h5>
                            <Suspense fallback={<Loading />}>
                                <TopThreeCourses />
                            </Suspense>
                        </div>
                    </section>
                </WompiProvider>
            </div>

        </section>
    );
}

export default DashboardPage;
