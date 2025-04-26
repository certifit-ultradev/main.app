import { cn } from "@/lib/utils";

const Skeleton = ({ className }) => (
    <div aria-live='polite' aria-busy='true' className={className}>
        <span className={cn('inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 leading-none')}>
            ‌
        </span>
        <br />
    </div >
)

const SVGSkeleton = ({ className }) => (
    <svg
        className={
            className + ' animate-pulse rounded bg-gray-300'
        }
    />
)

const Loading = () => (
    <>
        <div className={cn('mt-10 items-center justify-center')}>
            <div className={cn('flex flex-col lg:flex-row gap-8 p-6 mx-auto w-full max-w-lg min-w-0 md:min-w-[50rem] lg:min-w-[110rem]')}>
                <div className={cn('w-full lg:w-1/4 p-4 h-60')}>
                    <nav className={cn('flex flex-col gap-4')}>
                        <div className={cn('flex items-center gap-2')}>
                            <div className={cn('flex items-center justify-center w-10 h-10')}>
                                <SVGSkeleton className={cn('w-4 h-4')} />
                            </div>
                            <span className={cn('ml-3')}>
                                <Skeleton className={cn('w-[144px] max-w-full')} />
                            </span>
                        </div>
                        <div className={cn('flex items-center gap-2')}>
                            <div className={cn('flex items-center justify-center w-10 h-10')}>
                                <SVGSkeleton className={cn('w-4 h-4')} />
                            </div>
                            <span className={cn('ml-3')}>
                                <Skeleton className={cn('w-[48px] max-w-full')} />
                            </span>
                        </div>
                        <div className={cn('flex items-center gap-2')}>
                            <div className={cn('flex items-center justify-center w-10 h-10')}>
                                <SVGSkeleton className={cn('w-4 h-4')} />
                            </div>
                            <span className={cn('ml-3')}>
                                <Skeleton className={cn('w-[56px] max-w-full')} />
                            </span>
                        </div>
                    </nav>
                </div>
                <div className={cn('w-full lg:w-3/4')}>
                    <div className={cn('mb-6')}>
                        <h2>
                            <Skeleton className={cn('w-[144px] max-w-full')} />
                        </h2>
                        <div>
                            <Skeleton className={cn('w-[320px] max-w-full')} />
                        </div>
                    </div>
                    <form className={cn('space-y-6')}>
                        <div>
                            <label className={cn('block mb-2')}>
                                <Skeleton className={cn('w-[136px] max-w-full')} />
                            </label>
                            <div className={cn('w-full px-4 py-2 border border-gray-300')}>
                                <Skeleton className={cn('w-[136px] max-w-full')} />
                            </div>
                            <div className={cn('text-left w-full')}>
                                <Skeleton className={cn('w-[192px] max-w-full')} />
                            </div>
                        </div>
                        <div>
                            <label className={cn('block mb-2')}>
                                <Skeleton className={cn('w-[64px] max-w-full')} />
                            </label>
                            <div className={cn('w-full px-4 py-2 border border-gray-300')}>
                                <Skeleton className={cn('w-[64px] max-w-full')} />
                            </div>
                            <div className={cn('text-left w-full')}>
                                <Skeleton className={cn('w-[296px] max-w-full')} />
                            </div>
                        </div>
                        <div>
                            <label className={cn('block mb-2')}>
                                <Skeleton className={cn('w-[96px] max-w-full')} />
                            </label>
                            <div className={cn('w-full px-4 py-2 border border-gray-300')}>
                                <Skeleton className={cn('w-[176px] max-w-full')} />
                            </div>
                            <div className={cn('text-left w-full')}>
                                <Skeleton className={cn('w-[312px] max-w-full')} />
                            </div>
                        </div>
                        <div>
                            <label className={cn('block mb-2')}>
                                <Skeleton className={cn('w-[88px] max-w-full')} />
                            </label>
                            <div className={cn('w-full px-4 py-2 border border-gray-300')}></div>
                        </div>
                        <div>
                            <label className={cn('block mb-2')}>
                                <Skeleton className={cn('w-[88px] max-w-full')} />
                            </label>
                            <div className={cn('w-full px-4 py-2 border border-gray-300')}>
                                <Skeleton className={cn('w-[112px] max-w-full')} />
                            </div>
                            <div className={cn('text-left w-full')}>
                                <Skeleton className={cn('w-[232px] max-w-full')} />
                            </div>
                        </div>
                        <div>
                            <label className={cn('block mb-2')}>
                                <Skeleton className={cn('w-[496px] max-w-full')} />
                            </label>
                            <div className={cn('relative')}>
                                <div className={cn('w-full px-4 py-2 border border-gray-300')}></div>
                                <div className={cn('text-left w-full')}>
                                    <Skeleton className={cn('w-[96px] max-w-full')} />
                                </div>
                            </div>
                        </div>
                        <div className={cn('flex justify-end')}>
                            <div className={cn('w-[10rem] py-2 transition-colors')}>
                                <Skeleton className={cn('w-[72px] max-w-full')} />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </>
);
export default Loading;
