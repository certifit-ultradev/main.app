import { SessionProvider } from 'next-auth/react';
import '../globals.css';
import WompiProvider from '@/components/wompi-provider';
import { auth } from '@/auth';
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Certifit',
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
                <SessionProvider session={session}>
                    <WompiProvider>
                        {children}
                    </WompiProvider>
                </SessionProvider>
            </body>
        </html>
    )
}
