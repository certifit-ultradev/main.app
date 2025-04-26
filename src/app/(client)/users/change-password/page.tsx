import { NewPasswordForLoggedForm } from '@/components/user/change-password';
import { NextPage } from 'next';

const ChangePasswordPage: NextPage = async () => {
    return (
        <div className='h-screen'>
            <NewPasswordForLoggedForm />
        </div>
    );
};

export default ChangePasswordPage;