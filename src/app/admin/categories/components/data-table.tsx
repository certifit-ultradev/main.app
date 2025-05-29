'use client'

import {
    flexRender,
    getCoreRowModel,
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
import { CategoriesDataTableColumns } from './columns';
import { CourseCategoryData } from '@/utils/types'
import { listAllCourseCategories } from '@/actions/category/list'
import { deleteCategory } from '@/actions/category/register'
import Modal from '@/components/modal'
import { CheckIcon, XIcon } from '@/components/svg/certifit-icons'

export function CategoryListDataTable() {
    const [data, setData] = useState<CourseCategoryData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [actionResult, setActionnResult] = useState({
        success: false,
        message: ''
    });

    // useEffect para cargar datos cada vez que pageIndex o pageSize cambien
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await listAllCourseCategories();
                if (response.success) {
                    setData(response?.payload ?? []);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setIsLoading(false); // Fin de la carga
            }

        };

        fetchData();
    }, []);


    const handleDeleteCategory = async (id: number) => {
        const result = await deleteCategory({ data: { id: id } });
        setActionnResult({
            success: result.success ?? false,
            message: result.message ? result.message : ''
        });
        setIsOpen(true);
    };

    const handleModalClose = () => {
        setIsOpen(false);
        window.location.reload();
    };

    const table = useReactTable({
        data,
        columns: CategoriesDataTableColumns({ onDelete: handleDeleteCategory }),
        // Indicamos que la paginación es manual
        manualPagination: false,
        // Pasamos el estado de paginación actual
        // Definimos el número total de páginas que se mostrará en la paginación
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
                            <TableCell colSpan={CategoriesDataTableColumns.length} className={cn('p-4 text-center')}>Cargando...</TableCell>
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
                                <TableCell colSpan={CategoriesDataTableColumns.length} className={cn('h-24 text-center')}>
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
            {/* Modal de resultado */}
            <div>
                <Modal open={isOpen} setOpen={handleModalClose} closeButton={false}>
                    <div>
                        <div className={cn('sm:flex sm:items-start')}>
                            <div className={cn('text-center sm:text-left w-full')}>
                                <div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6')}>
                                    <div className={cn('rounded-2xl flex items-center justify-center w-[89px] h-[89px] bg-[#EBF9EE]')}>
                                        <div className={cn('rounded-2xl flex items-center justify-center w-[65px] h-[65px] bg-[#CEF4D7]')}>
                                            {actionResult.success ? <CheckIcon width={56} height={57} className={cn('text-5xl text')} /> : <XIcon width={56} height={57} className={cn('text-5xl text')} />}
                                        </div>
                                    </div>
                                </div>
                                <div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6')}>
                                    <p>Resultado</p>
                                </div>
                                <div className={cn('grid px-4 bg-[#F5F8FE] py-3 justify-items-center items-center sm:px-6')}>
                                    <p>{actionResult.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    )
}
