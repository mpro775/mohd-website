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
  serverSide?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  serverSide = false,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: DataTablePaginationProps<TData>) {
  const selectedRowsCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowsCount = serverSide ? (total ?? 0) : table.getFilteredRowModel().rows.length;
  const currentPageIndex = serverSide ? (page ? page - 1 : 0) : table.getState().pagination.pageIndex;
  const pageSize = serverSide ? (limit ?? 10) : table.getState().pagination.pageSize;
  const resolvedTotalPages = serverSide ? (totalPages ?? 1) : table.getPageCount();

  const canPreviousPage = serverSide ? (page ? page > 1 : false) : table.getCanPreviousPage();
  const canNextPage = serverSide ? (page && totalPages ? page < totalPages : false) : table.getCanNextPage();

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
            value={pageSize}
            onChange={(e) => {
              const nextSize = Number(e.target.value);
              if (serverSide && onLimitChange) {
                onLimitChange(nextSize);
              } else {
                table.setPageSize(nextSize);
              }
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
          {resolvedTotalPages > 0 ? (
            <span>
              الصفحة {currentPageIndex + 1} من {resolvedTotalPages}
            </span>
          ) : (
            <span>الصفحة 0 من 0</span>
          )}
        </div>

        {/* Pagination buttons controls */}
        <div className="flex items-center gap-1">
          {/* Go to first page */}
          <button
            onClick={() => {
              if (serverSide && onPageChange) onPageChange(1);
              else table.setPageIndex(0);
            }}
            disabled={!canPreviousPage}
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            title="الصفحة الأولى"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>

          {/* Go to previous page */}
          <button
            onClick={() => {
              if (serverSide && onPageChange && page) onPageChange(page - 1);
              else table.previousPage();
            }}
            disabled={!canPreviousPage}
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            title="الصفحة السابقة"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Go to next page */}
          <button
            onClick={() => {
              if (serverSide && onPageChange && page) onPageChange(page + 1);
              else table.nextPage();
            }}
            disabled={!canNextPage}
            className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
            title="الصفحة التالية"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Go to last page */}
          <button
            onClick={() => {
              if (serverSide && onPageChange && totalPages) onPageChange(totalPages);
              else table.setPageIndex(table.getPageCount() - 1);
            }}
            disabled={!canNextPage}
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
