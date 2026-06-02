"use client";

import React from "react";
import { Table } from "@tanstack/react-table";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { SlidersHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  columnLabels?: Record<string, string>;
  className?: string;
}

export function DataTableViewOptions<TData>({
  table,
  columnLabels = {},
  className,
}: DataTableViewOptionsProps<TData>) {
  // Get all columns that can be hidden
  const hideableColumns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide()
    );

  if (hideableColumns.length === 0) {
    return null;
  }

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none outline-none focus:ring-1 focus:ring-primary",
            className
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>عرض الأعمدة</span>
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={cn(
            "z-50 min-w-[180px] overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95"
          )}
          align="start"
        >
          <DropdownMenuPrimitive.Label className="px-2 py-1.5 text-xs font-black text-muted-foreground border-b border-border select-none mb-1">
            تبديل رؤية الأعمدة
          </DropdownMenuPrimitive.Label>

          {hideableColumns.map((column) => {
            const label = columnLabels[column.id] || column.id;
            const isVisible = column.getIsVisible();

            return (
              <DropdownMenuPrimitive.CheckboxItem
                key={column.id}
                checked={isVisible}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
                className={cn(
                  "relative flex items-center justify-between rounded-md px-8 py-2 text-xs font-semibold text-muted-foreground outline-none transition select-none hover:bg-muted hover:text-foreground cursor-pointer focus:bg-muted focus:text-foreground",
                  isVisible && "text-foreground font-bold"
                )}
              >
                <span>{label}</span>
                <span className="absolute right-2 flex.h-3.5 w-3.5 items-center justify-center">
                  {isVisible && <Check className="h-3.5 w-3.5 text-primary" />}
                </span>
              </DropdownMenuPrimitive.CheckboxItem>
            );
          })}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
