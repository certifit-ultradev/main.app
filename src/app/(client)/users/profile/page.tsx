'use client';

import { UserDetailsCard } from '@/components/user/user-details-card';
import { Button } from '@/components/ui/button';
import { useOptionalClientProfile } from '@/features/users/client/client-profile-context';

export default function ClientProfilePage() {
    const context = useOptionalClientProfile();
    if (!context || context.loading) return <p className="mx-auto max-w-4xl p-6">Cargando perfil...</p>;
    if (!context.profile) return <div className="mx-auto max-w-4xl p-6">
        <p role="alert">{context.error ?? 'No fue posible cargar el perfil.'}</p>
        <Button onClick={() => void context.refreshProfile()}>Reintentar</Button>
    </div>;
    return <UserDetailsCard title="Mi perfil" user={context.profile} editHref="/users/profile/edit" />;
}
