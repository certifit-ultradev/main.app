import { cn } from "@/lib/utils";

const Loading = () => (
    <div className={cn('mt-10')}>
        <div className={cn('space-y-4 w-full')}>
            <div className={cn('flex items-center justify-between w-full')}>
                <div className={cn('flex flex-1 items-center space-x-2 w-full')}>
                    <button
                        className="z-0 relative inline-flex items-center justify-center box-border appearance-none select-none 
        whitespace-nowrap font-normal subpixel-antialiased overflow-hidden tap-highlight-transparent 
        data-[pressed=true]:scale-[0.97] outline-none data-[focus-visible=true]:z-10 
        data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 
        px-4 min-w-20 h-10 text-small gap-2 transition-transform-colors-opacity motion-reduce:transition-none 
        bg-[#0BBBE7] text-white py-2 rounded-full hover:bg-[#009fdf] transition-colors"
                        type="button"
                        disabled
                    >
                        <div className={cn('animate-pulse bg-gray-200 h-4 w-16 rounded')}></div>
                    </button>
                </div>
            </div>

            <div className={cn('relative w-full overflow-auto')}>
                <table className={cn('caption-bottom text-sm table-auto w-full shadow-md rounded-lg border-separate border-spacing-y-2')}>
                    <thead className={cn('[&amp;_tr]:border-b')}>
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
                        </tr>
                    </thead>
                    <tbody className={cn('[&amp;_tr:last-child]:border-0')}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr
                                key={i}
                                className={cn('border-b hover:bg-muted/50 data-[state=selected]:bg-muted bg-[#EFF1F7] rounded-lg m-6 border-spacing-y-0 text-center')}
                                data-state="false"
                            >
                                <td className={cn('p-2 align-middle')}>
                                    <div className={cn('animate-pulse bg-gray-200 h-4 w-16 rounded mx-auto')}></div>
                                </td>
                                <td className={cn('p-2 align-middle')}>
                                    <div className={cn('animate-pulse bg-gray-200 h-4 w-16 rounded mx-auto')}></div>
                                </td>
                                <td className={cn('p-2 align-middle')}>
                                    <div className={cn('animate-pulse bg-gray-200 h-4 w-24 rounded mx-auto')}></div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={cn('flex items-center gap-2 mt-4')}>
                <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
      bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
                    disabled
                >
                    &lt;&lt;
                </button>
                <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
      bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
                    disabled
                >
                    &lt;
                </button>
                <span className={cn('text-sm text-muted-foreground')}>
                    <div className={cn('animate-pulse bg-gray-200 h-4 w-20 rounded inline-block')}></div>
                </span>
                <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
      bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
                    disabled
                >
                    &gt;
                </button>
                <button
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
      bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 disabled:pointer-events-none disabled:opacity-50"
                    disabled
                >
                    &gt;&gt;
                </button>
            </div>
        </div>
    </div>
);

export default Loading;
