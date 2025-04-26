import { cn } from "@/lib/utils";

const Loading = () => (
    <div className={cn('mt-10 w-full max-w-lg space-y-4 animate-pulse')}>
        <div>
            <h1 className={cn('text-2xl font-semibold mb-7 text-left w-full max-w-lg')}>
                <div className={cn('h-6 bg-gray-200 rounded w-32')}></div>
            </h1>

            <span className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>
                <div className={cn('h-4 bg-gray-200 rounded w-full')}></div>
                <div className={cn('h-4 mt-1 bg-gray-200 rounded w-3/4')}></div>
            </span>
        </div>
        <div className={cn('w-full mt-4 max-w-lg min-w-[20rem] space-y-4')}>
            <div className={cn('flex flex-wrap -mx-2 mb-4')}>
                <div className={cn('w-full md:w-1/2 px-2 mb-4 md:mb-0')}>
                    <div className={cn('w-full p-3 border border-gray-300 rounded-lg bg-gray-100 h-10')}></div>
                </div>
                <div className={cn('w-full md:w-1/2 px-2')}>
                    <div className={cn('w-full p-3 border border-gray-300 rounded-lg bg-gray-100 h-10')}></div>
                </div>
            </div>
            <div className={cn('flex flex-wrap mb-4')}>
                <div className={cn('w-full p-3 border border-gray-300 rounded-lg bg-gray-100 h-10')}></div>
            </div>
            <div className={cn('flex flex-wrap mb-4')}>
                <div className={cn('w-full')}>
                    <div className={cn('w-full p-3 border border-gray-300 rounded-lg bg-gray-100 h-10')}></div>
                </div>
            </div>
            <span className={cn('mt-3 text-gray-500 mb-6 text-left w-full max-w-lg')}>
                <div className={cn('h-4 bg-gray-200 rounded w-1/2')}></div>
            </span>
            <div className={cn('flex flex-wrap mb-4')}>
                <div className={cn('w-full p-3 border border-gray-300 rounded-lg bg-gray-100 h-10')}></div>
            </div>
            <div className={cn('mb-4 space-y-2')}>
                <div className={cn('flex items-center gap-2 text-lg font-medium')}>
                    <div className={cn('bg-gray-200 rounded-full h-5 w-5')}></div>
                    <div className={cn('h-4 bg-gray-200 rounded w-64')}></div>
                </div>
                <div className={cn('flex items-center gap-2 text-lg font-medium')}>
                    <div className={cn('bg-gray-200 rounded-full h-5 w-5')}></div>
                    <div className={cn('h-4 bg-gray-200 rounded w-56')}></div>
                </div>
                <div className={cn('flex items-center gap-2 text-lg font-medium')}>
                    <div className={cn('bg-gray-200 rounded-full h-5 w-5')}></div>
                    <div className={cn('h-4 bg-gray-200 rounded w-64')}></div>
                </div>
            </div>
            <div className={cn('flex flex-wrap mb-4')}>
                <div className={cn('w-full p-3 border border-gray-300 rounded-lg bg-gray-100 h-10')}></div>
            </div>
            <button className={cn('inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium shadow h-9 w-full bg-gray-200 rounded-full')}
                disabled
            >
            </button>
        </div>
    </div>

);

export default Loading;
