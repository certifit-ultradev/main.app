import type { Metadata } from 'next'
import '../../globals.css';

// These styles apply to every route in the application

export const metadata: Metadata = {
    title: 'Certifid',
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
                {children}
            </body>
        </html>
    )
}