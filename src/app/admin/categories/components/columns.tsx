'use client'

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CourseCategoryData } from '@/utils/types';
import { ColumnDef } from '@tanstack/react-table'
import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation'

export const CategoriesDataTableColumns = (): ColumnDef<CourseCategoryData>[] => {
    const router = useRouter();
    return [
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'name',
            header: 'Nombre(s)',
        },
        {
            header: 'Acciones',
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const course = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className={cn('h-8 w-8 p-0')}>
                                <span className='sr-only'>Abrir menu</span>
                                <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='bg-white'>
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem
                                className='hover:bg-gray-100'
                                onClick={() => {
                                    router.push(`/admin/categories/${course.id}/edit`);
                                }}
                            >
                                Editar categoria
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        }
    ];
}