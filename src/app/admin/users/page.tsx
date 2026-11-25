import { NextPage } from 'next';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { UserListDataTable } from './components/data-table';
import { Suspense } from 'react';
import Loading from './loading';

const UserIndexPage: NextPage = async () => {
    return (
        <Card className={cn('mt-10 w-full min-w-0')}>
            <CardContent className={cn('min-w-0 p-4 sm:p-6')}>
                <Suspense fallback={<Loading />}>
                    <UserListDataTable />
                </Suspense>
            </CardContent>
        </Card>
    );
};

export default UserIndexPage;
