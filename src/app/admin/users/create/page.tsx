'use client'

import { UserCreateEditForm } from '@/components/user/user-form';
import { NextPage } from 'next';

const CreateUsersPage: NextPage = () => {
    return (
        <UserCreateEditForm data={{
            name: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            identification: null,
            identificationType: null,
        }} />
    );
}

export default CreateUsersPage;
