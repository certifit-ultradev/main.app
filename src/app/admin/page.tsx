import { NextPage } from 'next';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CourseListDataTable, } from './components/data-table';
import { Suspense } from 'react';
import Loading from './loading';
import { CourseSellsChart, LastMonthCharts } from './components/course-sells-chart';

const DashboardPage: NextPage = async () => {

    return (
        <Card className={cn('mt-10 w-full min-w-0')}>
            <CardContent className={cn('min-w-0 p-4 sm:p-6')}>
                <div className={cn('flex min-w-0 flex-col gap-4 xl:flex-row')}>
                    <LastMonthCharts />
                    <Card className={cn('w-full min-w-0 flex-1 bg-[#F9F9FC]')}>
                        <CardContent className={cn('min-w-0 p-3 sm:p-6')}>
                            <CourseSellsChart />
                        </CardContent>
                    </Card>
                </div>
                <div className={cn('mt-2')}>
                    <Suspense fallback={<Loading />}>
                        <CourseListDataTable />
                    </Suspense>
                </div>
            </CardContent>
        </Card>
    );
};

export default DashboardPage;
