"use client";

import React, { useState, useEffect } from "react";
import { Table } from "@tanstack/react-table";
import { Search, X, Download, ShieldCheck, ChevronDown } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey: string;
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  bulkActions?: BulkAction[];
  onBulkAction?: (action: string, selectedIds: string[]) => void | Promise<void>;
  columnLabels?: Record<string, string>;
  exportFilename?: string;
  className?: string;
  serverSide?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filtersValue?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "البحث...",
  filterOptions = [],
  bulkActions = [],
  onBulkAction,
  columnLabels = {},
  exportFilename = "export_data",
  className,
  serverSide = false,
  searchValue: propSearchValue = "",
  onSearchChange,
  filtersValue = {},
  onFilterChange,
}: DataTableToolbarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;
  
  // Search local state for debouncing
  const [searchValue, setSearchValue] = useState("");

  // Sync initial state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (serverSide) {
        setSearchValue(propSearchValue);
      } else {
        const tableSearchValue = (table.getColumn(searchKey)?.getFilterValue() as string) ?? "";
        setSearchValue(tableSearchValue);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [table, searchKey, serverSide, propSearchValue]);

  // Debounced search trigger (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (serverSide) {
        if (onSearchChange) onSearchChange(searchValue);
      } else {
        table.getColumn(searchKey)?.setFilterValue(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchKey, table, serverSide, onSearchChange]);

  // Helper to export table data to UTF-8 CSV with Arabic BOM support
  const handleExportCSV = () => {
    try {
      const rowsToExport = hasSelection ? selectedRows : table.getFilteredRowModel().rows;
      if (rowsToExport.length === 0) {
        toast.error("لا توجد بيانات لتصديرها");
        return;
      }

      const columns = table
         .getAllColumns()
         .filter((col) => typeof col.accessorFn !== "undefined" && col.id !== "select" && col.id !== "actions");

      // Build CSV headers
      const headers = columns.map((col) => columnLabels[col.id] || col.id);
      
      // Build CSV data rows
      const csvRows = rowsToExport.map((row) => {
        return columns.map((col) => {
          const value = row.getValue(col.id);
          if (value === undefined || value === null) return "";
          if (typeof value === "object") return JSON.stringify(value).replace(/"/g, '""');
          return String(value).replace(/"/g, '""');
        });
      });

      // Assemble CSV string with quotes & UTF-8 BOM
      const csvString = [
        headers.map((h) => `"${h}"`).join(","),
        ...csvRows.map((row) => row.map((val) => `"${val}"`).join(",")),
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${exportFilename}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(
        hasSelection
          ? `تم تصدير ${selectedRows.length} صفوف محددة بنجاح`
          : `تم تصدير جميع البيانات المعروضة (${rowsToExport.length} صفاً) بنجاح`
      );
    } catch {
      toast.error("فشل تصدير البيانات");
    }
  };

  const handleBulkClick = async (action: string) => {
    if (!onBulkAction) return;
    const selectedIds = selectedRows.map((row) => {
      const original = row.original as { id?: string; _id?: string };
      return original.id ?? original._id ?? "";
    }).filter(Boolean);

    await onBulkAction(action, selectedIds);
    table.resetRowSelection();
  };

  return (
    <div
      className={cn("flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between select-none", className)}
      dir="rtl"
    >
      {/* Search and Filters */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pr-9 pl-4 text-xs font-semibold outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue("")}
              className="absolute left-2.5 top-2.5 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Filters */}
        {filterOptions.map((filter) => {
          const hasColumn = table.getAllColumns().some((col) => col.id === filter.key);
          if (!hasColumn && !serverSide) return null;

          const column = table.getColumn(filter.key);
          if (!column && !serverSide) return null;

          const filterValue = serverSide
            ? (filtersValue[filter.key] || "all")
            : (column ? ((column.getFilterValue() as string) ?? "all") : "all");

          return (
            <select
              key={filter.key}
              value={filterValue}
              onChange={(e) => {
                const value = e.target.value;
                if (serverSide && onFilterChange) {
                  onFilterChange(filter.key, value === "all" ? "" : value);
                } else if (column) {
                  column.setFilterValue(value === "all" ? undefined : value);
                }
              }}
              className="h-9 rounded-lg border border-border bg-card px-3 text-xs font-bold outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">كل {filter.label}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        })}
      </div>

      {/* Actions: Bulk selection, Export, Column Visibility */}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        {/* Bulk Action Popover */}
        {hasSelection && bulkActions.length > 0 && (
          <PopoverPrimitive.Root>
            <PopoverPrimitive.Trigger asChild>
              <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-3 text-xs font-bold text-primary hover:bg-primary/20 cursor-pointer transition select-none outline-none animate-bounce">
                <ShieldCheck className="h-4 w-4" />
                <span>إجراءات جماعية ({selectedRows.length})</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </PopoverPrimitive.Trigger>

            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                className="z-50 w-48 rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95"
                align="center"
              >
                <div className="space-y-0.5">
                  {bulkActions.map((act) => (
                    <button
                      key={act.action}
                      onClick={() => handleBulkClick(act.action)}
                      className={cn(
                        "w-full text-right flex items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition hover:bg-muted cursor-pointer select-none",
                        act.variant === "danger"
                          ? "text-danger hover:bg-danger/10"
                          : act.variant === "warning"
                          ? "text-warning hover:bg-warning/10"
                          : "text-foreground"
                      )}
                    >
                      <span>{act.label}</span>
                    </button>
                  ))}
                </div>
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        )}

        {/* CSV Exporter */}
        <button
          onClick={handleExportCSV}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none outline-none focus:ring-1 focus:ring-primary"
          title={hasSelection ? "تصدير العناصر المحددة" : "تصدير الجدول بالكامل"}
        >
          <Download className="h-3.5 w-3.5" />
          <span>تصدير CSV</span>
        </button>

        {/* View Options */}
        <DataTableViewOptions table={table} columnLabels={columnLabels} />
      </div>
    </div>
  );
}
