import { cn } from "@/lib/utils";

export default function Loading() {
    return (
        <div className={cn('p-6 w-[110rem] my-4 mx-auto bg-white rounded-xl shadow-md space-y-4')}>
            <div className={cn('animate-pulse')}>
                <h2 className={cn('text-2xl font-semibold mb-4')}>
                    <div className={cn('h-6 bg-gray-200 rounded w-40')}></div>
                </h2>
                <div className={cn('space-y-2')}>
                    <div className={cn('flex justify-between items-center')}>
                        <div className={cn('h-4 bg-gray-200 rounded w-20')}></div>
                        <div className={cn('h-4 bg-gray-200 rounded w-24')}></div>
                    </div>
                    <div className={cn('flex justify-between items-center')}>
                        <div className={cn('h-4 bg-gray-200 rounded w-20')}></div>
                        <div className={cn('h-4 bg-gray-200 rounded w-24')}></div>
                    </div>
                    <div className={cn('flex justify-between items-center')}>
                        <div className={cn('h-4 bg-gray-200 rounded w-20')}></div>
                        <div className={cn('h-4 bg-gray-200 rounded w-32')}></div>
                    </div>
                    <div className={cn('flex justify-between items-center')}>
                        <div className={cn('h-4 bg-gray-200 rounded w-20')}></div>
                        <div className={cn('h-4 bg-gray-200 rounded w-24')}></div>
                    </div>
                    <div className={cn('flex justify-between items-center')}>
                        <div className={cn('h-4 bg-gray-200 rounded w-20')}></div>
                        <div className={cn('h-4 bg-gray-200 rounded w-12')}></div>
                    </div>
                    <div className={cn('flex justify-between items-center')}>
                        <div className={cn('h-4 bg-gray-200 rounded w-24')}></div>
                        <div className={cn('h-4 bg-gray-200 rounded w-12')}></div>
                    </div>
                    <div className={cn('flex justify-between items-center')}>
                        <div className={cn('h-4 bg-gray-200 rounded w-16')}></div>
                        <div className={cn('h-4 bg-gray-200 rounded w-20')}></div>
                    </div>
                    <div className={cn('flex justify-between items-center')}>
                        <div className={cn('h-4 bg-gray-200 rounded w-20')}></div>
                        <div className={cn('h-4 bg-gray-200 rounded w-20')}></div>
                    </div>
                </div>
                <div className={cn('flex justify-end mt-4')}>
                    <button
                        className={cn('inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium focus - visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 bg-gray-200 text-transparent py-2 rounded-full')}
                        disabled
                    >
                        <div className={cn('h-4 bg-gray-200 rounded w-24')}></div>
                    </button>
                </div>
            </div>
        </div>
    );
}