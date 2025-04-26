'use client'

import { UserCreateEditForm } from '@/components/user/user-form';
import { NextPage } from 'next';

const CreateUsersPage: NextPage = () => {
    return (
        <UserCreateEditForm data={{
            id: '',
            name: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
        }} />
    );
}

export default CreateUsersPage;