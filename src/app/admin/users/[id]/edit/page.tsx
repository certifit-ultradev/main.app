import { notFound } from 'next/navigation'
import { UserCreateEditForm } from '@/components/user/user-form';
import { fetchUserById } from '@/actions/user/exist';

type EditUsersProps = {
    params: {
        id: string;
    }
};

const EditUsersPage = async ({ params }: EditUsersProps) => {
    const { id } = await params;
    const result = await fetchUserById({ data: { id } });
    if (!result.success && !result.payload) {
        notFound(); // Si no se encuentra el usuario, muestra una página 404
    }

    return (
        <UserCreateEditForm data={{
            id: result.payload?.id,
            name: result.payload?.name,
            lastName: result.payload?.lastName,
            email: result.payload?.email,
            phoneNumber: result.payload?.phoneNumber
        }} />
    );
};

export default EditUsersPage;