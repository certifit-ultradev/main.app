'use client'

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { UserList } from '@/utils/types';
import { ColumnDef } from '@tanstack/react-table'
import { MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation'

interface CreateUserColumnsProps {
    onActivate: (id: string) => Promise<void>;
    onDeactivate: (id: string) => Promise<void>;
}

export const UserDataTableColumns = ({ onActivate, onDeactivate }: CreateUserColumnsProps): ColumnDef<UserList>[] => {
    const router = useRouter();
    return [
        {
            accessorKey: 'name',
            header: 'Nombre(s)',
        },
        {
            accessorKey: 'lastName',
            header: 'Apellido(s)',
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Teléfono',
        },
        {
            accessorKey: 'createdAt',
            header: 'Fecha creación',
        },
        {
            accessorKey: 'updatedAt',
            header: 'Fecha actualización',
        },
        {
            accessorKey: 'emailVerified',
            header: 'Estado',
            cell: ({ row }) => {
                let status = <span className={cn('box-decoration-slice p-1 rounded-lg bg-[#CACAD0]')}>Email No Verificado</span>
                if (row.getValue('emailVerified')) {
                    status = <span className={cn('text-white p-1 rounded-lg box-decoration-slice bg-[#2A8940]')}>Email Verificado</span>
                }

                return status;
            }
        },
        {
            header: 'Acciones',
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const user = row.original;
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
                                    router.push(`/admin/users/${user.id}/edit`);
                                }}
                            >
                                Editar usuario
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='hover:bg-gray-100'
                                onClick={async () => {
                                    if (!user.emailVerified) {
                                        await onActivate(user.id as string);
                                    } else {
                                        await onDeactivate(user.id as string);
                                    }
                                }}
                            >
                                {!user.emailVerified ? 'Activar' : 'Desactivar'} usuario
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className='hover:bg-gray-100'
                                onClick={() => {
                                    router.push(`/admin/users/${user.id}/view`);
                                }}
                            >Ver usuario</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        }
    ]
}