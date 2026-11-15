import { notFound } from 'next/navigation'
import { UserCreateEditForm } from '@/components/user/user-form';
import { fetchUserById } from '@/actions/user/exist';

interface EditUsersPageProps {
    params: Promise<{ id: string }>;
}

const EditUsersPage = async ({ params }: EditUsersPageProps) => {
    const { id } = await params;
    const result = await fetchUserById({ id });
    if (!result.ok) {
        notFound(); // Si no se encuentra el usuario, muestra una página 404
    }

    return (
        <UserCreateEditForm data={{
            id: result.data.id,
            name: result.data.name,
            lastName: result.data.lastName,
            email: result.data.email,
            phoneNumber: result.data.phoneNumber,
            identification: result.data.identification,
            identificationType: result.data.identificationType,
        }} />
    );
};

export default EditUsersPage;
