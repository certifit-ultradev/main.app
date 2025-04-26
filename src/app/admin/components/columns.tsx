"use client"

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CourseList } from "@/utils/types";
import { ColumnDef } from "@tanstack/react-table"
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation"

interface CreateCourseColumnsProps {
    onActivate: (id: number) => Promise<void>;
    onDeactivate: (id: number) => Promise<void>;
}

export function CreateCourseDataTableColumns({ onActivate, onDeactivate }: CreateCourseColumnsProps): ColumnDef<CourseList>[] {
    const router = useRouter();
    return [
        {
            accessorKey: "title",
            header: "Curso",
        },
        {
            accessorKey: "sells",
            header: "Compras",
        },
        {
            accessorKey: "isActive",
            header: "Estado",
            cell: ({ row }) => {
                let status = <span className={cn('box-decoration-slice p-1 rounded-lg bg-[#CACAD0]')}>Inactivo</span>
                if (row.getValue("isActive") === true) {
                    status = <span className={cn('text-white p-1 rounded-lg box-decoration-slice bg-[#2A8940]')}>Activo</span>
                }

                return status;
            }
        },
        {
            header: "Acciones",
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const course = row.original
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className={cn('h-8 w-8 p-0')}>
                                <span className={cn('sr-only')}>Abrir menu</span>
                                <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className='bg-white'>
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem
                                className='hover:bg-gray-100'
                                onClick={() => {
                                    router.push(`/admin/courses/${course.id}/edit`);
                                }}
                            >
                                Editar curso
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='hover:bg-gray-100' onClick={() => {
                                router.push(`/admin/courses/${course.id}/view`);
                            }}>Ver curso</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className='hover:bg-gray-100' onClick={async () => {
                                // Llamamos a la función onActivate pasada desde el padre
                                if (!course.isActive) {
                                    await onActivate(course.id);
                                } else {
                                    await onDeactivate(course.id);                                    
                                }
                            }}>{course.isActive ? 'Desactivar' : 'Activar'} curso</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        }
    ]
}
