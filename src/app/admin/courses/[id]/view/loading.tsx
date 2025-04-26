import { cn } from '@/lib/utils'
import React from 'react'

export default function Loading() {
	return (
		<div className={cn('flex flex-col items-center h-screen py-10 mx-auto px-10 animate-pulse')}>
			<div className={cn('bg-background-card w-full my-10 rounded-xl flex flex-col')}>
				<div className={cn('h-[5vh] w-full rounded-t-xl bg-gray-200')}></div>
				<div className={cn('flex-grow space-y-8')}>
					<div className={cn('flex flex-col space-y-4')}>
						<div className={cn('flex justify-between')}>
							<div className={cn('h-[3vh] w-1/4 bg-gray-200 rounded')}></div>
							<div className={cn('h-[3vh] w-3/4 bg-gray-200 rounded')}></div>
						</div>
						<div className={cn('flex justify-between')}>
							<div className={cn('h-[3vh] w-1/4 bg-gray-200 rounded')}></div>
							<div className={cn('h-[3vh] w-3/4 bg-gray-200 rounded')}></div>
						</div>
						<div className={cn('flex justify-between')}>
							<div className={cn('h-[3vh] w-1/4 bg-gray-200 rounded')}></div>
							<div className={cn('h-[3vh] w-3/4 bg-gray-200 rounded')}></div>
						</div>
						<div className={cn('flex justify-between')}>
							<div className={cn('h-[3vh] w-1/4 bg-gray-200 rounded')}></div>
							<div className={cn('h-[3vh] w-3/4 bg-gray-200 rounded')}></div>
						</div>
					</div>
					<div className={cn('w-full rounded-b-xl h-12 bg-gray-200')}></div>
				</div>
				<div className={cn('w-full flex flex-col items-center py-4')}>
					<div className={cn('w-1/3 bg-gray-200 h-12 rounded')}></div>
					<div className={cn('mt-4 bg-gray-200 h-12 w-1/4 rounded')}></div>
				</div>
			</div>
		</div>
	)
}
