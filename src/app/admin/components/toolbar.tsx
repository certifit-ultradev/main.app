'use client'

import { cn } from '@/lib/utils'
import { Button } from '@nextui-org/react'
import { useRouter } from 'next/navigation'

export function DataTableToolbar() {
    const router = useRouter();

    const handleRedirect = () => {
        router.push('/admin/courses/create');
    }

    return (
        <div className={cn('flex items-center justify-between')}>
            <div className={cn('flex flex-1 items-center space-x-2')}>
                <Button className={cn('bg-[#0BBBE7] text-white py-2 rounded-full hover:bg-[#009fdf] transition-colors')} onClick={handleRedirect}>
                    Agregar
                </Button>
            </div>
        </div>
    )
}