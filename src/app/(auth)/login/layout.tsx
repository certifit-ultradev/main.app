import type { Metadata } from 'next'
import '../../globals.css';
import { AppHeroUIProvider } from '@/components/heroui-provider';

// These styles apply to every route in the application

export const metadata: Metadata = {
    title: 'Certifit',
    description: 'Certifit',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <AppHeroUIProvider>{children}</AppHeroUIProvider>
            </body>
        </html>
    )
}
