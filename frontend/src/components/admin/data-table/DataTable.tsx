"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import { EmptyState } from "../StateComponents";
import { cn } from "@/lib/utils";

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface BulkAction {
  action: string;
  label: string;
  variant?: "danger" | "primary" | "warning";
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  bulkActions?: BulkAction[];
  onBulkAction?: (action: string, selectedIds: string[]) => void | Promise<void>;
  columnLabels?: Record<string, string>;
  exportFilename?: string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "البحث في الجدول...",
  filterOptions = [],
  bulkActions = [],
  onBulkAction,
  columnLabels = {},
  exportFilename = "data_export",
  isLoading = false,
  emptyTitle = "لا توجد نتائج معروضة",
  emptyDescription = "لم نجد أي بيانات مطابقة لخيارات البحث الحالية.",
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const visibleColumnsCount = table.getVisibleFlatColumns().length;

  return (
    <div className={cn("space-y-4 select-none w-full", className)} dir="rtl">
      {/* 1. Header Toolbar (Search, Filter, Export, Column Visibility) */}
      {searchKey && (
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          filterOptions={filterOptions}
          bulkActions={bulkActions}
          onBulkAction={onBulkAction}
          columnLabels={columnLabels}
          exportFilename={exportFilename}
        />
      )}

      {/* 2. Core Grid and Responsive layout container */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden w-full">
        {/* A. DESKTOP VIEW (Large tables layout) */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar w-full">
          <table className="w-full text-right border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-border bg-muted/20 hover:bg-muted/30">
                  {headerGroup.headers.map((header) => {
                    const isSortable = header.column.getCanSort();
                    const sortState = header.column.getIsSorted();

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          "px-4 py-3.5 text-xs font-black text-muted-foreground whitespace-nowrap",
                          isSortable && "cursor-pointer hover:text-foreground"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center gap-1.5 select-none">
                            <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                            {isSortable && (
                              <span className="text-muted-foreground/60 transition-colors">
                                {sortState === "asc" ? (
                                  <ArrowUp className="h-3 w-3 text-primary" />
                                ) : sortState === "desc" ? (
                                  <ArrowDown className="h-3 w-3 text-primary" />
                                ) : (
                                  <ArrowUpDown className="h-3 w-3 opacity-40" />
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            
            <tbody>
              {isLoading ? (
                // Desktop Loading Skeleton rows
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="border-b border-border/60 animate-pulse">
                    {Array.from({ length: visibleColumnsCount }).map((_, cIdx) => (
                      <td key={cIdx} className="px-4 py-4">
                        <div className="h-4 bg-muted/65 rounded w-2/3" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnsCount} className="h-24">
                    <EmptyState title={emptyTitle} description={emptyDescription} className="border-none" />
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border/60 hover:bg-muted/25 transition-colors duration-150"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3.5 text-sm font-medium text-foreground max-w-sm truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* B. MOBILE CARD VIEW (Responsive elements) */}
        <div className="md:hidden divide-y divide-border/60 w-full">
          {isLoading ? (
            // Mobile Loading Skeleton Cards
            Array.from({ length: 3 }).map((_, rIdx) => (
              <div key={rIdx} className="p-4 space-y-3 animate-pulse bg-card">
                <div className="flex justify-between border-b border-border/40 pb-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, fIdx) => (
                    <div key={fIdx} className="flex justify-between">
                      <div className="h-3.5 bg-muted rounded w-1/4" />
                      <div className="h-3.5 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} className="border-none py-12" />
          ) : (
            table.getRowModel().rows.map((row) => {
              const cells = row.getVisibleCells();
              // Extract selection and action cells if present
              const selectCell = cells.find((c) => c.column.id === "select");
              const actionsCell = cells.find((c) => c.column.id === "actions");
              // Get standard data cells (excluding check and action)
              const dataCells = cells.filter((c) => c.column.id !== "select" && c.column.id !== "actions");

              return (
                <div
                  key={row.id}
                  className={cn(
                    "p-4 space-y-3 transition bg-card/45 hover:bg-muted/10",
                    row.getIsSelected() && "bg-primary/5"
                  )}
                >
                  {/* Mobile Row Header: Selector and Actions */}
                  {(selectCell || actionsCell) && (
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <div className="flex items-center gap-2">
                        {selectCell && flexRender(selectCell.column.columnDef.cell, selectCell.getContext())}
                        <span className="text-[10px] font-bold text-muted-foreground select-none">تحديد الصف</span>
                      </div>
                      {actionsCell && (
                        <div className="flex items-center">
                          {flexRender(actionsCell.column.columnDef.cell, actionsCell.getContext())}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mobile Key-Value Listing */}
                  <div className="space-y-2">
                    {dataCells.map((cell) => {
                      const label = columnLabels[cell.column.id] || cell.column.id;
                      return (
                        <div key={cell.id} className="flex justify-between items-start gap-4 text-xs">
                          <span className="font-bold text-muted-foreground shrink-0">{label}:</span>
                          <span className="font-semibold text-foreground text-left break-all">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Pagination Controls */}
      {table.getRowModel().rows.length > 0 && !isLoading && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}
