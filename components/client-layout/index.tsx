'use client'

import { useState } from 'react'
import { type PropsWithChildren, type JSX } from 'react'
import { cn } from '@/lib/utils'
import Navbar from '../navbar'
import { Slash } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { useSession } from 'next-auth/react'
import { ClientProfileProvider, useOptionalClientProfile } from '@/features/users/client/client-profile-context'


export interface LayoutProps extends PropsWithChildren {
    heightClass?: string
    additionalClass?: string
}

type ClientBreadcrumb = {
    id: 'home' | 'current-page';
    label: string;
};

function Greeting({ fallbackName }: { fallbackName?: string | null }) {
    const profile = useOptionalClientProfile()?.profile;
    return <p>Hola de nuevo, {profile?.name ?? fallbackName}</p>;
}

function Layout(props: LayoutProps): JSX.Element {
    const { children, additionalClass = '' } = props
    const { data } = useSession();
    const [breadcrumbs, setBreadcrumbs] = useState<ClientBreadcrumb[]>([{ id: 'home', label: 'Inicio' }]);

    const navigate = (page: string) => {
        if (page === "Inicio") {
            setBreadcrumbs([{ id: 'home', label: 'Inicio' }])
        } else {
            setBreadcrumbs([{ id: 'home', label: 'Inicio' }, { id: 'current-page', label: page }])
        }
    }

    return (
        <ClientProfileProvider><main
            className={cn({
                'min-h-screen items-center max-md:justify-center  max-md:mx-0 max-md:h-auto max-md:w-full':
                    true,
                [additionalClass]: !!additionalClass,
            })}
        >
            {<Navbar />}
            <div className={cn('w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8')}>
                <div className={cn('mt-10')}>
                    <div className={cn('mb-5 justify-start')}>
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb, index) => (
                                    <BreadcrumbItem key={crumb.id}>
                                        {index > 0 && (
                                            <Slash className={cn('h-4 w-4 mx-2 text-gray-400')} aria-hidden="true" />
                                        )}
                                        {index < breadcrumbs.length - 1 ? (
                                            <BreadcrumbLink
                                                href="#"
                                                onClick={() => navigate(crumb.label)}
                                            >
                                                {crumb.label}
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className={cn('justify-start')}><Greeting fallbackName={data?.user.name} /></div>
                </div>
            </div>
            {children}
        </main></ClientProfileProvider>
    )
}

export default Layout
