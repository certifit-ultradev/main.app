import { NextPage } from 'next';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryListDataTable } from './components/data-table';
import { Suspense } from 'react';
import Loading from './loading';

const CategoryIndexPage: NextPage = async () => {
    return (
        <Card className={cn('mt-10 w-full max-w-lg min-w-0 md:min-w-[30rem] lg:min-w-[110rem]')}>
            <CardContent>
                <Suspense fallback={<Loading/>}>
                    <CategoryListDataTable />
                </Suspense>
            </CardContent>
        </Card>
    );
};

export default CategoryIndexPage;