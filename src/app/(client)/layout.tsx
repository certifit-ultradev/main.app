import Layout from "@/components/client-layout"
import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import '../globals.css';
import { auth } from "@/auth";
import { AppHeroUIProvider } from '@/components/heroui-provider';
import { SpeedInsights } from '@vercel/speed-insights/next';

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
                    <AppHeroUIProvider>
                        <Layout>
                            {children}
                        </Layout>
                    </AppHeroUIProvider>
                </SessionProvider>
                <SpeedInsights />
            </body>
        </html>
    )
}
