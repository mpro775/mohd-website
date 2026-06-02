"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/api/types";

export const categoryColumnLabels: Record<string, string> = {
  name: "اسم التصنيف",
  isActive: "الحالة",
  description: "الوصف",
};

interface CreateColumnsProps {
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  onActivate?: (id: string) => void;
  onDeactivate?: (id: string) => void;
}

export function createCategoryColumns({
  onEdit,
  onDelete,
  onActivate,
  onDeactivate,
}: CreateColumnsProps): ColumnDef<Category>[] {
  return [
    // 1. Selection Checkbox
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // 2. Name & Slug
    {
      accessorKey: "name",
      header: "اسم التصنيف",
      cell: ({ row }) => (
        <div className="flex flex-col text-right max-w-[200px]">
          <span className="font-bold text-foreground truncate">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground truncate font-mono" dir="ltr">
            {row.original.slug}
          </span>
        </div>
      ),
    },

    // 3. Description
    {
      accessorKey: "description",
      header: "الوصف التوضيحي",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
          {row.original.description || <span className="italic text-muted-foreground/35">بلا وصف</span>}
        </span>
      ),
    },

    // 4. Active Status
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => {
        const isActive = row.original.isActive !== false;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold select-none",
              isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
            )}
          >
            {isActive ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
            <span>{isActive ? "نشط" : "معطل"}</span>
          </span>
        );
      },
    },

    // 5. Actions
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
        const id = category.id ?? category._id ?? "";

        return (
          <DropdownMenuPrimitive.Root>
            <DropdownMenuPrimitive.Trigger asChild>
              <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none outline-none">
                <MoreHorizontal className="h-4.5 w-4.5" />
              </button>
            </DropdownMenuPrimitive.Trigger>

            <DropdownMenuPrimitive.Portal>
              <DropdownMenuPrimitive.Content
                className="z-50 min-w-[150px] overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95 align-start"
                align="start"
              >
                <div className="space-y-0.5 text-right" dir="rtl">
                  {/* Edit */}
                  <DropdownMenuPrimitive.Item
                    onClick={() => onEdit(category)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none select-none"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>تعديل التصنيف</span>
                  </DropdownMenuPrimitive.Item>

                  {/* Activate / Deactivate toggles */}
                  {onActivate && !category.isActive && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onActivate(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 cursor-pointer outline-none select-none"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>تنشيط وتفعيل</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  {onDeactivate && category.isActive && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onDeactivate(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 cursor-pointer outline-none select-none"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>تعطيل وإلغاء تنشيط</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  <div className="h-px bg-border my-1" />

                  {/* Delete */}
                  <DropdownMenuPrimitive.Item
                    onClick={() => onDelete(id)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-danger hover:bg-danger/10 cursor-pointer outline-none select-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>حذف نهائي</span>
                  </DropdownMenuPrimitive.Item>
                </div>
              </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
          </DropdownMenuPrimitive.Root>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
