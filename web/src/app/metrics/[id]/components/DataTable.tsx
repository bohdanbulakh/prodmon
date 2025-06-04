'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel, PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TerminateDialog from '@/app/metrics/[id]/components/TerminateDialog';
import { useMemo, useState } from 'react';
import { round } from '@/lib/utils';

export type ProcessInfo = {
  pid: number;
  name: string;
  memory_used_percent: number;
}

type Props = {
  data: ProcessInfo[];
  hostname: string;
}

export default function DataTableDemo ({ data, hostname }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    [],
  );
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<ProcessInfo>[] = useMemo(() => [
    {
      accessorKey: 'pid',
      header: ({ column }) => {
        const order = column.getIsSorted();

        return <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          PID
          {order === 'asc' ? <ArrowUp/> : !!order ? <ArrowDown/> : <ArrowUpDown/>}
        </Button>;
      },
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue('pid')}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => {
        const order = column.getIsSorted();

        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Назва процесу
            {order === 'asc' ? <ArrowUp/> : !!order ? <ArrowDown/> : <ArrowUpDown/>}
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'memory_used_percent',
      header: ({ column }) => {
        const order = column.getIsSorted();

        return <Button
          variant="ghost"
          onClick={() => column.toggleSorting(order === 'asc')}
        >
          Використання ОП, (%)
          {order === 'asc' ? <ArrowUp/> : !!order ? <ArrowDown/> : <ArrowUpDown/>}
        </Button>;
      },
      cell: ({ row }) => {
        const data = round(Number.parseFloat(row.getValue('memory_used_percent')), 3);
        return <div className="font-medium">{data}</div>;
      },
    },
    {
      id: 'terminate',
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <TerminateDialog pid={row.getValue('pid')} hostname={hostname}>
            <Button>Зупинити процес</Button>
          </TerminateDialog>
        );
      },
    },
  ], [hostname]);


  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    autoResetPageIndex: false,
    state: {
      sorting: sorting,
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Знайти за назвою"
          value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('name')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Немає даних
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end items-center space-x-2 mt-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="h-4 w-4"/>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4"/>
        </Button>
        <span className="text-sm text-muted-foreground px-2">
          Сторінка {table.getState().pagination.pageIndex + 1} з {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4"/>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="h-4 w-4"/>
        </Button>
      </div>
    </div>
  );
}
