import { fetchUserById } from '@/actions/user/exist';
import { UserDetailRow, UserDetailsCard } from '@/components/user/user-details-card';
import { notFound } from 'next/navigation';

export default async function UserViewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const result = await fetchUserById({ id });
    if (!result.ok) notFound();
    const user = result.data;

    return <UserDetailsCard title="Detalles del Usuario" user={user} editHref={`/admin/users/${id}/edit`}
        extraRows={<>
            <UserDetailRow label="Administrador" value={user.isAdmin ? 'Sí' : 'No'} />
            <UserDetailRow label="Correo verificado" value={user.emailVerified ? 'Sí' : 'No'} />
        </>}
    />;
}
