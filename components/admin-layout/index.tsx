'use client'

import { usePathname } from 'next/navigation'
import { type PropsWithChildren, type JSX } from 'react'
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
        const id = segments.slice(0, index + 1).join('/');
        if (isLast || maybeID) {
            return { id, label };
        } else {
            const href =
                "/" +
                segments
                    .slice(0, index + 1)
                    .map((s) => fixRoute(s))
                    .join("/");

            return { id, label, href };
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
                'relative flex min-h-screen w-full min-w-0 flex-col items-center':
                    true,
                [additionalClass]: !!additionalClass,
            })}
        >
            {<Navbar />}
            <div className={cn('w-full max-w-[110rem] min-w-0 px-4 sm:px-6 lg:px-8')}>
                <div className={cn('mt-10')}>
                    <div className={cn('mb-5 justify-start')}>
                        <Breadcrumb items={items} />
                    </div>
                    <div className={cn('justify-start')}><p>Hola de nuevo, {data?.user.name}</p></div>
                </div>
            </div>
            <div className={cn('w-full max-w-[110rem] min-w-0 px-4 pb-10 sm:px-6 lg:px-8')}>
                {children}
            </div>
        </main>
    )
}

export default Layout
