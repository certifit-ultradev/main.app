import { NextPage } from 'next';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CourseListDataTable, } from './components/data-table';
import { Suspense } from 'react';
import Loading from './loading';
import { CourseSellsChart, LastMonthCharts } from './components/course-sells-chart';

const DashboardPage: NextPage = async () => {

    return (
        <Card className={cn('w-full mt-10 max-w-lg min-w-0 md:min-w-[50rem] lg:min-w-[110rem]')}>
            <CardContent>
                <div className={cn('flex justify-center m-4 space-x-4')}>
                    <LastMonthCharts />
                    <Card className={cn('min-w-0 w-[55rem] bg-[#F9F9FC]')}>
                        <CardContent>
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