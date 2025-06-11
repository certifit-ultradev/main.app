'use client' // Error boundaries must be Client Components

import { cn } from '@/lib/utils'
import './globals.css';
 
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    // global-error must include html and body tags
    <div className={cn('flex items-center justify-center mt-16')}>
        <div className={cn('text-center space-y-6 px-4')}>
            <h1 className={cn('text-6xl font-extrabold text-black')}>Error</h1>
            <h2 className={cn('text-2xl text-black font-semibold')}>{error.message}</h2>
            <a href="/" className={cn('text-blue-500 hover:underline')}>
                Regresar al inicio
            </a>
        </div>
    </div>
  )
}