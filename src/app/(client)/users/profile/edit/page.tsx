'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ProfileAvatar } from '@/components/user/profile-avatar';
import { useOptionalClientProfile } from '@/features/users/client/client-profile-context';
import { saveClientProfile, uploadClientProfileImage } from '@/features/users/client/profile-api';
import { ClientProfileFieldsSchema, UpdateClientProfileSchema, type UpdateClientProfileInput } from '@/interfaces/http/users/profile.contract';
import { PhoneNumberField } from '@/components/form/phone-number-field';

export default function EditClientProfilePage() {
    const context = useOptionalClientProfile();
    const profile = context?.profile;
    const router = useRouter();
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const [removePhoto, setRemovePhoto] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!profile) return;
        setName(profile.name);
        setLastName(profile.lastName);
        setPhoneNumber(profile.phoneNumber);
    }, [profile]);

    if (!context || context.loading) return <p className="mx-auto max-w-4xl p-6">Cargando perfil...</p>;
    if (!profile) return <div className="mx-auto max-w-4xl p-6">
        <p role="alert">{context.error ?? 'No fue posible cargar el perfil.'}</p>
        <Button onClick={() => void context.refreshProfile()}>Reintentar</Button>
    </div>;

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;
        setError(null);
        const patch: UpdateClientProfileInput = {};
        if (name.trim() !== profile.name) patch.name = name.trim();
        if (lastName.trim() !== profile.lastName) patch.lastName = lastName.trim();
        if (phoneNumber.trim() !== profile.phoneNumber) patch.phoneNumber = phoneNumber.trim();
        if (removePhoto && profile.profileImage) patch.profileImage = null;
        if (Object.keys(patch).length === 0 && !file) {
            setError('No hay cambios para guardar.');
            return;
        }
        const validated = (file ? ClientProfileFieldsSchema : UpdateClientProfileSchema).safeParse(patch);
        if (!validated.success) {
            setError(validated.error.issues[0]?.message ?? 'Datos inválidos.');
            return;
        }

        setSaving(true);
        try {
            if (file) {
                patch.profileImage = uploadedUrl ?? await uploadClientProfileImage(profile.id, file);
                if (!uploadedUrl) setUploadedUrl(patch.profileImage);
            }
            const saved = await saveClientProfile(UpdateClientProfileSchema.parse(patch));
            context.setProfile(saved);
            router.push('/users/profile');
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'No fue posible guardar el perfil.');
        } finally {
            setSaving(false);
        }
    };

    return <section className="mx-auto my-6 w-full max-w-4xl rounded-xl bg-white p-6 shadow-md">
        <h1 className="mb-5 text-2xl font-semibold">Editar mi perfil</h1>
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="flex items-center gap-4">
                <ProfileAvatar name={name} lastName={lastName} imageUrl={removePhoto ? null : profile.profileImage} size={72} />
                <div className="space-y-2">
                    <label htmlFor="profileImage" className="block font-medium">Foto de perfil (opcional)</label>
                    <input ref={fileInput} id="profileImage" type="file" accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => { setFile(event.target.files?.[0] ?? null); setUploadedUrl(null); setRemovePhoto(false); }} />
                    {file && <p className="text-sm text-gray-600">Seleccionada: {file.name}</p>}
                    {(profile.profileImage || file) && <button type="button" className="block text-sm text-red-600"
                        onClick={() => { setFile(null); setUploadedUrl(null); setRemovePhoto(true); if (fileInput.current) fileInput.current.value = ''; }}>
                        Quitar foto
                    </button>}
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">Nombres
                    <input className="w-full rounded-md border p-2" value={name} onChange={(event) => setName(event.target.value)} required />
                </label>
                <label className="space-y-1">Apellidos
                    <input className="w-full rounded-md border p-2" value={lastName} onChange={(event) => setLastName(event.target.value)} required />
                </label>
            </div>
            <div className="block space-y-1"><span>Teléfono</span>
                <PhoneNumberField id="clientProfilePhoneNumber" value={phoneNumber} onChange={setPhoneNumber} size="compact" />
            </div>
            <div><span className="font-medium">Correo electrónico</span><p className="rounded-md bg-gray-100 p-2">{profile.email}</p></div>
            {error && <p role="alert" className="text-red-600">{error}</p>}
            <div className="flex gap-3">
                <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
                <Button type="button" variant="outline" onClick={() => router.push('/users/profile')}>Cancelar</Button>
            </div>
        </form>
    </section>;
}
