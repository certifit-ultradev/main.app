import { cn } from "@/lib/utils";

export default function NotFound() {
    return (
        <div className={cn('flex items-center justify-center mt-16')}>
            <div className={cn('text-center space-y-6 px-4')}>
                <h1 className={cn('text-6xl font-extrabold text-black')}>404</h1>
                <h2 className={cn('text-2xl text-black font-semibold')}>Página no encontrada</h2>
                <p className={cn('text-gray-700 max-w-md mx-auto')}>
                    La página que buscas no existe o fue movida.
                </p>
            </div>
        </div>
    );
}
