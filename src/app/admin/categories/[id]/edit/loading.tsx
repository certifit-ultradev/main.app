import { cn } from "@/lib/utils";

const Loading = () => (
    <div className={cn('animate-pulse flex flex-col bg-white p-10')}>
        <h1 className={cn('text-2xl font-semibold mb-4 text-left w-full max-w-lg')}>
            <div className={cn('h-6 bg-gray-200 rounded w-32')}></div>
        </h1>

        <div className={cn('relative mb-4')}>
        </div>

        <form className={cn('w-full max-w-lg min-w-[20rem] space-y-4')}>
            <div className={cn('flex flex-wrap -mx-2 mb-4')}>
                <div className={cn('w-full px-2')}>
                    <div className={cn('h-10 bg-gray-200 rounded')}></div>
                </div>
            </div>

            <div className={cn('h-10 bg-gray-200 rounded w-full')}></div>
        </form>
    </div>

);

export default Loading;
