'use client'

import { usePathname } from 'next/navigation'
import { type PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'
import Navbar from '../navbar'
import { useSession } from 'next-auth/react'
import { Breadcrumb, BreadcrumbItem, fixRoute, getSegmentName, isLikelyID } from '../breadcrumb'

export interface LayoutProps extends PropsWithChildren {
    heightClass?: string
    additionalClass?: string
}

function Layout(props: LayoutProps): JSX.Element {
    const { children, additionalClass = '' } = props
    const { data } = useSession();

    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    const items: BreadcrumbItem[] = segments.map((seg, index) => {
        const label = getSegmentName(seg);
        const isLast = index === segments.length - 1;
        const maybeID = isLikelyID(seg);
        if (isLast || maybeID) {
            return { label };
        } else {
            const href =
                "/" +
                segments
                    .slice(0, index + 1)
                    .map((s) => fixRoute(s))
                    .join("/");

            return { label, href };
        }
    });

    // Si no hay segmentos, no mostramos breadcrumb
    // Por ejemplo, si la ruta es "/" puede que no quieras mostrar breadcrumb
    if (items.length === 0) {
        return <>{children}</>;
    }

    return (
        <main
            className={cn({
                'relative flex flex-col min-h-screen items-center max-md:justify-center  max-md:mx-0 max-md:h-auto max-md:w-full':
                    true,
                [additionalClass]: !!additionalClass,
            })}
        >
            {<Navbar />}
            <div className={cn('w-full max-w-lg min-w-0 md:min-w-[48rem] lg:min-w-[110rem]')}>
                <div className={cn('mt-10')}>
                    <div className={cn('mb-5 justify-start')}>
                        <Breadcrumb items={items} />
                    </div>
                    <div className={cn('justify-start')}><p>Hola de nuevo, {data?.user.name}</p></div>
                </div>
            </div>
            {children}
        </main>
    )
}

export default Layout