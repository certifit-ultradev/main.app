import { cn } from '@/lib/utils'
import type { Metadata } from 'next'
import '../../globals.css';
import { auth } from '@/auth';

// These styles apply to every route in the application

export const metadata: Metadata = {
    title: 'Certifid',
    description: 'Certifit',
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth();
    
    return (
        <html lang="en">
            <body>
                <nav className={cn('h-20 w-full bg-[#27282B] flex justify-end px-12 py-1 max-md:items-center max-md:pl-8')}>
                    <div className={cn('flex items-center h-full w-2/5 justify-end')}>
                        {!session?.user && (<>
                            <span className={cn('text-white')}>
                                Ya tienes una cuenta?
                            </span>
                            <a href="/login" className={cn('ml-5 font-semibold cursor-pointer text-[#0BBBE7]')}> Iniciar sesión </a></>)}
                    </div>
                </nav>
                {children}
            </body>
        </html>
    )
}