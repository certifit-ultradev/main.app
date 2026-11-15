import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from './profile-avatar';

type UserDetails = {
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    profileImage?: string | null;
    identification?: string | null;
    identificationType?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
};

export function UserDetailRow({ label, value }: { label: string; value: ReactNode }) {
    return <div className="flex flex-wrap justify-between gap-2 border-b border-gray-100 py-2">
        <span className="text-gray-600">{label}:</span>
        <span className="font-medium text-right">{value}</span>
    </div>;
}

/** Shared read-only profile layout for administrators and clients. */
export function UserDetailsCard({
    title, user, editHref, extraRows,
}: { title: string; user: UserDetails; editHref: string; extraRows?: ReactNode }) {
    return <section className="mx-auto my-6 w-full max-w-4xl space-y-5 rounded-xl bg-white p-6 shadow-md">
        <div className="flex items-center gap-4">
            <ProfileAvatar name={user.name} lastName={user.lastName} imageUrl={user.profileImage ?? null} size={72} />
            <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div>
            <UserDetailRow label="Nombres" value={user.name} />
            <UserDetailRow label="Apellidos" value={user.lastName} />
            <UserDetailRow label="Correo" value={user.email} />
            <UserDetailRow label="Teléfono" value={user.phoneNumber} />
            <UserDetailRow label="Identificación" value={user.identification || 'No proporcionada'} />
            <UserDetailRow label="Tipo de identificación" value={user.identificationType || 'No especificado'} />
            {user.createdAt && <UserDetailRow label="Creado" value={new Date(user.createdAt).toLocaleDateString('es-CO')} />}
            {user.updatedAt && <UserDetailRow label="Actualizado" value={new Date(user.updatedAt).toLocaleDateString('es-CO')} />}
            {extraRows}
        </div>
        <div className="flex justify-end">
            <Button asChild className="rounded-full bg-[#0BBBE7] text-white hover:bg-[#009fdf]">
                <Link href={editHref}>Editar</Link>
            </Button>
        </div>
    </section>;
}
