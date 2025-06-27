'use client' // Error boundaries must be Client Components

import { cn } from '@/src/lib/utils'
import { useEffect } from 'react'

export default function Error({
    error
}: {
    error: Error & { digest?: string }
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Course not purchased error:', error.message)
    }, [error])

    return (
        <div className={cn('flex items-center justify-center mt-16')}>
            <div className={cn('text-center space-y-6 px-4')}>
                <h1 className={cn('text-6xl font-extrabold text-black')}>Error</h1>
                <h2 className={cn('text-2xl text-black font-semibold')}>{error.message}</h2>
            </div>
        </div>
    )
}