'use client'

import { useState } from 'react'
import { type PropsWithChildren } from 'react'
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


export interface LayoutProps extends PropsWithChildren {
    heightClass?: string
    additionalClass?: string
}

function Layout(props: LayoutProps): JSX.Element {
    const { children, additionalClass = '' } = props
    const { data } = useSession();
    const [breadcrumbs, setBreadcrumbs] = useState(["Inicio"]);

    const navigate = (page: string) => {
        if (page === "Inicio") {
            setBreadcrumbs(["Inicio"])
        } else {
            setBreadcrumbs(["Inicio", page])
        }
    }

    return (
        <main
            className={cn({
                'min-h-screen items-center max-md:justify-center  max-md:mx-0 max-md:h-auto max-md:w-full':
                    true,
                [additionalClass]: !!additionalClass,
            })}
        >
            {<Navbar />}
            <div className={cn('w-full max-w-lg min-w-0 md:min-w-[48rem] lg:min-w-[110rem]')}>
                <div className={cn('mx-20 mt-10')}>
                    <div className={cn('mb-5 justify-start')}>
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb, index) => (
                                    <BreadcrumbItem key={index}>
                                        {index > 0 && (
                                            <Slash className={cn('h-4 w-4 mx-2 text-gray-400')} aria-hidden="true" />
                                        )}
                                        {index < breadcrumbs.length - 1 ? (
                                            <BreadcrumbLink
                                                href="#"
                                                onClick={() => navigate(crumb)}
                                            >
                                                {crumb}
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>{crumb}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className={cn('justify-start')}><p>Hola de nuevo, {data?.user.name}</p></div>
                </div>
            </div>
            {children}
        </main>
    )
}

export default Layout