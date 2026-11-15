import Image from 'next/image';
import { profileInitials } from '@/features/users/profile-initials';

export function ProfileAvatar({
    name, lastName, imageUrl, size = 40,
}: { name: string; lastName: string; imageUrl: string | null; size?: number }) {
    return <span
        className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-700 font-semibold text-white"
        style={{ width: size, height: size }}
        aria-label={`Perfil de ${name} ${lastName}`.trim()}
    >
        {imageUrl
            ? <Image src={imageUrl} alt="" fill sizes={`${size}px`} className="object-cover" />
            : <span aria-hidden="true">{profileInitials(name, lastName)}</span>}
    </span>;
}
