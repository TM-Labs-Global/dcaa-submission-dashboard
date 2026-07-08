'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ArrowsDownUp,
  CalendarBlank,
  CaretLeft,
  CaretLineLeft,
  CaretLineRight,
  CaretRight,
  Download,
  MagnifyingGlass,
  UserCircle,
  X,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
];

const sortOptionState = {
  newest: [{ id: 'joinedAt', desc: true }],
  oldest: [{ id: 'joinedAt', desc: false }],
  'name-asc': [{ id: 'name', desc: false }],
  'name-desc': [{ id: 'name', desc: true }],
};

function fullName(row) {
  return [row.firstName, row.lastName].filter(Boolean).join(' ') || '—';
}

function formatJoined(iso) {
  const date = new Date(iso);
  return {
    day: date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }),
    time: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  };
}

function formatDisplayDate(date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const columns = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all downloads on this page"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label={`Select ${fullName(row.original)}`}
        />
      </div>
    ),
    enableHiding: false,
  },
  {
    id: 'name',
    accessorFn: (row) => fullName(row),
    header: 'Downloader',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-md border bg-muted">
          <UserCircle className="size-4 text-muted-foreground" />
        </span>
        <span className="truncate font-medium text-sm">{fullName(row.original)}</span>
      </div>
    ),
    enableHiding: false,
  },
  {
    id: 'search',
    accessorFn: (row) => `${fullName(row)} ${row.email} ${row.location ?? ''}`,
    filterFn: 'includesString',
    enableHiding: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span className="truncate text-sm">{row.original.email}</span>,
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => <span className="text-sm">{row.original.location || '—'}</span>,
  },
  {
    accessorKey: 'joinedAt',
    header: 'Downloaded',
    cell: ({ row }) => {
      const { day, time } = formatJoined(row.original.joinedAt);
      return (
        <div className="grid gap-0.5">
          <span className="text-sm">{day}</span>
          <span className="text-muted-foreground text-xs">at {time}</span>
        </div>
      );
    },
  },
];

export function SubscriberTable({ subscribers, formId, formName }) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([{ id: 'joinedAt', desc: true }]);
  const [columnVisibility] = React.useState({ search: false });
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 });

  // Local date filter — scopes both the visible rows and the export.
  // No range selected = all subscribers, all-time (default).
  const [dateOpen, setDateOpen] = React.useState(false);
  const [tempRange, setTempRange] = React.useState({ from: undefined, to: undefined });
  const [appliedRange, setAppliedRange] = React.useState(null);

  const filteredByDate = React.useMemo(() => {
    if (!appliedRange) return subscribers;
    const from = new Date(appliedRange.from);
    from.setHours(0, 0, 0, 0);
    const to = new Date(appliedRange.to);
    to.setHours(23, 59, 59, 999);

    return subscribers.filter((s) => {
      const joined = new Date(s.joinedAt);
      return joined >= from && joined <= to;
    });
  }, [subscribers, appliedRange]);

  const table = useReactTable({
    data: filteredByDate,
    columns,
    state: { rowSelection, columnFilters, sorting, columnVisibility, pagination },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const searchQuery = table.getColumn('search')?.getFilterValue() ?? '';
  const sortValue = React.useMemo(() => {
    const currentSort = sorting[0];
    if (!currentSort) return 'newest';
    if (currentSort.id === 'joinedAt' && currentSort.desc) return 'newest';
    if (currentSort.id === 'joinedAt' && !currentSort.desc) return 'oldest';
    if (currentSort.id === 'name' && !currentSort.desc) return 'name-asc';
    if (currentSort.id === 'name' && currentSort.desc) return 'name-desc';
    return 'newest';
  }, [sorting]);

  function handleApplyDateRange() {
    if (tempRange.from && tempRange.to) {
      setAppliedRange({ from: tempRange.from, to: tempRange.to });
      setDateOpen(false);
      table.setPageIndex(0);
    }
  }

  function handleClearDateRange() {
    setAppliedRange(null);
    setTempRange({ from: undefined, to: undefined });
    setDateOpen(false);
    table.setPageIndex(0);
  }

  function handleExport(format) {
    const params = new URLSearchParams({ formId, format });
    if (appliedRange) {
      params.set('dateFrom', appliedRange.from.toISOString().slice(0, 10));
      params.set('dateTo', appliedRange.to.toISOString().slice(0, 10));
    }
    window.location.href = `/api/stats/subscribers/export?${params.toString()}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-96">
            <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-md py-2 pl-8"
              placeholder="Search downloads..."
              value={searchQuery}
              onChange={(event) => {
                table.getColumn('search')?.setFilterValue(event.target.value || undefined);
                table.setPageIndex(0);
              }}
            />
          </div>

          {/* Hidden per request — boss may want this back later. Keep logic intact. */}
          <div className="hidden">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
                <ArrowsDownUp className="size-4" />
                Sort
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={sortValue}
                  onValueChange={(value) => {
                    table.setSorting(sortOptionState[value] ?? sortOptionState.newest);
                    table.setPageIndex(0);
                  }}
                >
                  {sortOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground">
              <CalendarBlank className="size-4 text-muted-foreground" />
              {appliedRange ? (
                <span className="font-medium text-foreground">
                  {formatDisplayDate(appliedRange.from)} – {formatDisplayDate(appliedRange.to)}
                </span>
              ) : (
                <span className="text-muted-foreground">Download date</span>
              )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="range" selected={tempRange} onSelect={setTempRange} numberOfMonths={2} />
              <div className="flex items-center justify-between border-t p-2">
                <button
                  onClick={handleClearDateRange}
                  className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground"
                >
                  <X className="size-3.5" />
                  Clear
                </button>
                <Button onClick={handleApplyDateRange} disabled={!tempRange.from || !tempRange.to}>
                  Apply range
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md border border-primary bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <Download aria-hidden="true" size={16} />
              Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xlsx')}>Export Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader className="bg-muted/15">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} className="h-11 p-3 font-medium">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-3 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {appliedRange ? 'No downloads in this period.' : 'No downloads yet for this form.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="hidden flex-1 text-muted-foreground text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="download-rows-per-page" className="font-medium text-sm">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger size="sm" className="w-20" id="download-rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center font-medium text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <CaretLineLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <CaretLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <CaretRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <CaretLineRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
