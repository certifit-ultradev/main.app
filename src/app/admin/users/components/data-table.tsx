'use client'

import {
    flexRender,
    getCoreRowModel,
    PaginationState,
    useReactTable,
} from '@tanstack/react-table'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { DataTableToolbar } from './toolbar'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { listAll } from '@/actions/user/list'
import { UserList } from '@/utils/types'
import { UserDataTableColumns } from './columns';

export function UserListDataTable() {
    const [data, setData] = useState<UserList[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Estado local de paginación: pageIndex y pageSize
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0, // Índice de página inicial (0-based)
        pageSize: 10, // Cantidad de registros por página
    });

    // useEffect para cargar datos cada vez que pageIndex o pageSize cambien
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await listAll({ data: { page: pagination.pageIndex + 1 } });
                if (response.success) {
                    setData(response?.payload?.data ?? []);
                    setTotalPages(response.payload?.total ?? 0);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setIsLoading(false); // Fin de la carga
            }

        };

        fetchData();
    }, [pagination.pageIndex, pagination.pageSize]);


    const table = useReactTable({
        data,
        columns: UserDataTableColumns(),
        // Indicamos que la paginación es manual
        manualPagination: true,
        // Pasamos el estado de paginación actual
        state: {
            pagination,
        },
        // Definimos el número total de páginas que se mostrará en la paginación
        pageCount: totalPages,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className={cn('mt-10')}>
            <DataTableToolbar />
            <Table className='table-auto w-full shadow-md rounded-lg border-separate border-spacing-y-2'>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead className='text-center' key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={UserDataTableColumns.length} className={cn('p-4 text-center')}>Cargando...</TableCell>
                        </TableRow>
                    ) : (
                        table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                    className={row.index % 2 == 0 ? 'bg-[#EFF1F7] rounded-lg m-6 border-spacing-y-0 text-center' : 'bg-[#F9F9FC] rounded-lg m-6 border-spacing-y-0 text-center'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={UserDataTableColumns.length} className={cn('h-24 text-center')}>
                                    No results.
                                </TableCell>
                            </TableRow>
                        )
                    )}
                </TableBody>
            </Table>
            <div className={cn('flex items-center gap-2 mt-4')}>
                <Button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<<'}
                </Button>
                <Button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    {'<'}
                </Button>
                <span>
                    Página{' '}
                    <strong>
                        {table.getState().pagination.pageIndex + 1} de{' '}
                        {table.getPageCount()}
                    </strong>{' '}
                </span>
                <Button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    {'>'}
                </Button>
                <Button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                >
                    {'>>'}
                </Button>
            </div>
        </div>

    )
}
