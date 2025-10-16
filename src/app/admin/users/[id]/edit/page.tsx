import { notFound } from 'next/navigation'
import { UserCreateEditForm } from '@/components/user/user-form';
import { fetchUserById } from '@/actions/user/exist';

// @ts-expect-error: params
const EditUsersPage = async ({ params }) => {
    const { id } = await params;
    const result = await fetchUserById({ data: { id } });
    if (!result.success && !result.payload) {
        notFound(); // Si no se encuentra el usuario, muestra una página 404
    }

    return (
        <UserCreateEditForm data={{
            id: result.payload?.id,
            name: result.payload?.name as string,
            lastName: result.payload?.lastName as string,
            email: result.payload?.email as string,
            phoneNumber: result.payload?.phoneNumber as string,
            identification: result.payload?.identification as string,
            identificationType: result.payload?.identificationType as string,
        }} />
    );
};

export default EditUsersPage;