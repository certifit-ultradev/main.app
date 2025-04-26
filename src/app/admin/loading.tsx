import { cn } from "@/lib/utils";

const Loading = () => (
    <div className={cn('mt-10')}>
        <div className={cn('space-y-4 w-full')}>
            <div className={cn('flex items-center justify-between')}>
                <div className={cn('flex flex-1 items-center space-x-2')}>
                    <button
                        className="z-0 group relative inline-flex items-center justify-center box-border appearance-none select-none 
        whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent 
        data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 
        data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 
        px-4 min-w-20 h-10 text-small gap-2 [&>svg]:max-w-[theme(spacing.8)] transition-transform-colors-opacity 
        motion-reduce:transition-none data-[hover=true]:opacity-hover bg-[#0BBBE7] text-white py-2 rounded-full 
        hover:bg-[#009fdf] transition-colors"
                        type="button"
                        disabled
                    >
                        <div className={cn('animate-pulse bg-gray-200 h-4 w-16 rounded')}></div>
                    </button>
                </div>
            </div>
            <div className={cn('relative w-full overflow-auto')}>
                <table className={cn('caption-bottom text-sm table-auto w-full shadow-md rounded-lg border-separate border-spacing-y-2')}>
                    <thead className={cn('[&_tr]:border-b')}>
                        <tr className={cn('border-b hover:bg-muted/50 data-[state=selected]:bg-muted')}>
                            <th className={cn('h-10 px-2 align-middle font-medium text-muted-foreground text-center')}>
                                <div className={cn('animate-pulse bg-gray-200 h-4 w-20 rounded mx-auto')}></div>
                            </th>
                            <th className={cn('h-10 px-2 align-middle font-medium text-muted-foreground text-center')}>
                                <div className={cn('animate-pulse bg-gray-200 h-4 w-20 rounded mx-auto')}></div>
                            </th>
                            <th className={cn('h-10 px-2 align-middle font-medium text-muted-foreground text-center')}>
                                <div className={cn('animate-pulse bg-gray-200 h-4 w-20 rounded mx-auto')}></div>
                            </th>
                            <th className={cn('h-10 px-2 align-middle font-medium text-muted-foreground text-center')}>
                                <div className={cn('animate-pulse bg-gray-200 h-4 w-20 rounded mx-auto')}></div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className={cn('[&_tr:last-child]:border-0')}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <tr
                                key={i}
                                className={`border-b hover:bg-muted/50 data-[state=selected]:bg-muted ${i % 2 === 0 ? "bg-[#EFF1F7]" : "bg-[#F9F9FC]"
                                    } rounded-lg m-6 border-spacing-y-0 text-center`}
                                data-state="false"
                            >
                                <td className={cn('p-2 align-middle')}>
                                    <div className={cn('animate-pulse bg-gray-200 h-4 w-24 rounded mx-auto')}></div>
                                </td>
                                <td className={cn('p-2 align-middle')}>
                                    <div className={cn('animate-pulse bg-gray-200 h-4 w-16 rounded mx-auto')}></div>
                                </td>
                                <td className={cn('p-2 align-middle')}>
                                    <div className={cn('animate-pulse bg-gray-200 h-4 w-16 rounded mx-auto')}></div>
                                </td>
                                <td className={cn('p-2 align-middle')}>
                                    <div className={cn('animate-pulse bg-gray-200 h-8 w-8 rounded-full mx-auto')}></div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
export default Loading;
