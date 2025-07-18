import { NewPasswordForLoggedForm } from '@/components/user/change-password';
import { NextPage } from 'next';
import { cn } from '@/src/lib/utils'

const ChangePasswordPage: NextPage = async () => {
    return (
        <div className={cn('h-screen')}>
            <NewPasswordForLoggedForm />
        </div>
    );
};

export default ChangePasswordPage;