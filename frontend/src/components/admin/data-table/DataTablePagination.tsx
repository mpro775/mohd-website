"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  className?: string;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
}: DataTablePaginationProps<TData>) {
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowsCount = table.getFilteredRowModel().rows.length;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-3 select-none",
        className
      )}
      dir="rtl"
    >
      {/* 1. Selection summary */}
      <div className="flex-1 text-sm text-muted-foreground text-right">
        {selectedRowsCount > 0 ? (
          <span>
            تم تحديد {selectedRowsCount} من أصل {totalRowsCount} صفوف.
          </span>
        ) : (
          <span>إجمالي العناصر: {totalRowsCount}</span>
        )}
      </div>

      {/* 2. Controls and pages size selection */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 justify-end">
        {/* Page size dropdown selector */}
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-muted-foreground">عدد العناصر المعروضة:</p>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold outline-none focus:border-primary cursor-pointer"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} عناصر
              </option>
            ))}
          </select>
        </div>

        {/* Current page indicator */}
        <div className="flex items-center justify-center text-xs font-bold text-foreground" dir="ltr">
          {table.getPageCount() > 0 ? (
            <span>
              الصفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
            </span>
          ) : (
            <span>الصفحة 0 من 0</span>
          )}
        </div>

        {/* Pagination buttons controls */}
        <div className="flex items-center gap-1">
          {/* Go to first page */}
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            title="الصفحة الأولى"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>

          {/* Go to previous page */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            title="الصفحة السابقة"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Go to next page */}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            title="الصفحة التالية"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Go to last page */}
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            title="الصفحة الأخيرة"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
