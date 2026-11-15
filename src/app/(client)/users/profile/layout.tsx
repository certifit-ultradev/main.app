import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function ClientProfileLayout({ children }: { children: ReactNode }) {
    const session = await auth();
    if (!session?.user?.id) redirect('/login?callbackUrl=%2Fusers%2Fprofile');
    if (session.user.isAdmin) redirect('/admin');
    return children;
}
