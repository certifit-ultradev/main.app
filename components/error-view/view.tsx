import { cn } from '@/src/lib/utils'

export const ErrorView = (message:string) => {
    return (
        <div className={cn('flex items-center justify-center mt-16')}>
            <div className={cn('text-center space-y-6 px-4')}>
                <h1 className={cn('text-6xl font-extrabold text-black')}>No es posible procesar la solicitud</h1>
                <h2 className={cn('text-2xl text-black font-semibold')}>{message}</h2>
            </div>
        </div>
    )
}