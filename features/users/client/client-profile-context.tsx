'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import type { ClientProfileDto } from '@/application/users/user.dto';
import { fetchClientProfile } from './profile-api';

type ClientProfileContextValue = {
    profile: ClientProfileDto | null;
    loading: boolean;
    error: string | null;
    setProfile: (profile: ClientProfileDto) => void;
    refreshProfile: () => Promise<void>;
};

const ClientProfileContext = createContext<ClientProfileContextValue | null>(null);

export function ClientProfileProvider({ children }: { children: ReactNode }) {
    const { status, data: session } = useSession();
    const [profile, setProfile] = useState<ClientProfileDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refreshProfile = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchClientProfile(signal);
            if (!signal?.aborted) setProfile(result);
        } catch (reason) {
            if (!signal?.aborted) setError(reason instanceof Error ? reason.message : 'No fue posible consultar el perfil.');
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status !== 'authenticated' || session?.user.isAdmin) {
            setProfile(null);
            setError(null);
            setLoading(false);
            return;
        }
        setProfile(null);
        const controller = new AbortController();
        void refreshProfile(controller.signal);
        return () => controller.abort();
    }, [status, session?.user.id, session?.user.isAdmin, refreshProfile]);

    return <ClientProfileContext.Provider value={{
        profile, loading, error, setProfile,
        refreshProfile: () => refreshProfile(),
    }}>{children}</ClientProfileContext.Provider>;
}

/** Returns null in admin layouts, where the client profile provider is absent. */
export const useOptionalClientProfile = () => useContext(ClientProfileContext);
