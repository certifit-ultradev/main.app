"use client"

import {
    flexRender,
    getCoreRowModel,
    PaginationState,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTableToolbar } from "./toolbar"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { CourseList } from "@/utils/types"
import { CreateCourseDataTableColumns } from "./columns"
import { listAll } from "@/actions/courses/list"
import { Button } from "@/components/ui/button"
import Modal from "@/components/modal"
import { activate } from "@/actions/courses/activate"
import { deactivate } from "@/actions/courses/deactivate"
import { CheckIcon, XIcon } from "@/components/svg/certifit-icons"

export function CourseListDataTable() {
    const [data, setData] = useState<CourseList[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [activationResult, setActivationResult] = useState({
        success: false,
        message: ''
    });

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0, // Índice de página inicial (0-based)
        pageSize: 10, // Cantidad de registros por página
    });

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

    const handleActivateCourse = async (id: number) => {
        const result = await activate({ data: { id: id } });
        setActivationResult({
            success: true,
            message: result.message ? result.message : ''
        });
        setIsOpen(true);
    };

    const handleDectivateCourse = async (id: number) => {
        const result = await deactivate({ data: { id: id } });
        setActivationResult({
            success: true,
            message: result.message ? result.message : ''
        });
        setIsOpen(true);
    };

    const columns = CreateCourseDataTableColumns({ onActivate: handleActivateCourse, onDeactivate: handleDectivateCourse });

    const table = useReactTable({
        data,
        columns: columns,
        manualPagination: true,
        state: {
            pagination,
        },
        pageCount: totalPages,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleModalClose = () => {
        setIsOpen(false); // Cerrar el modal
        window.location.reload(); // Redirigir a /admin
    };

    return (
        <>
            <div className={cn('mt-10')}>
                <DataTableToolbar />
                <Table className={cn('table-auto w-full shadow-md rounded-lg border-separate border-spacing-y-2')}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead className={cn('text-center')} key={header.id}>
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
                                <TableCell colSpan={columns.length} className={cn('p-4 text-center')}>Cargando...</TableCell>
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
                                    <TableCell colSpan={columns.length} className={cn('h-24 text-center')}>
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </div>
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
                                            {activationResult.success ? <CheckIcon width={56} height={57} className={cn('text-5xl text')} /> : <XIcon width={56} height={57} className={cn('text-5xl text')} />}
                                        </div>
                                    </div>
                                </div>
                                <div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6')}>
                                    <p>Resultado activación</p>
                                </div>
                                <div className={cn('grid px-4 bg-[#F5F8FE] py-3 justify-items-center items-center sm:px-6')}>
                                    <p>{activationResult.message}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </>


    )
}
