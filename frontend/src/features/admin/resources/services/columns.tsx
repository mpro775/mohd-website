"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Globe, Star, Ban, ArrowUp, ArrowDown } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import type { Service } from "@/lib/api/types";

export const serviceColumnLabels: Record<string, string> = {
  name: "اسم الخدمة",
  startingPrice: "السعر المبدئي",
  duration: "مدة التسليم",
  isPublished: "الحالة",
  isFeatured: "مميز",
};

interface CreateColumnsProps {
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onReorder?: (service: Service, direction: "up" | "down") => void;
}

export function createServiceColumns({
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onReorder,
}: CreateColumnsProps): ColumnDef<Service>[] {
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

    // 2. Icon Thumbnail
    {
      id: "icon",
      header: "أيقونة",
      cell: ({ row }) => {
        const iconUrl = row.original.icon;
        return (
          <div className="h-9 w-9 rounded-lg border border-border overflow-hidden bg-muted/40 flex items-center justify-center select-none shrink-0">
            {iconUrl ? (
              <img src={iconUrl} alt="icon" className="h-full w-full object-cover bg-muted/20" />
            ) : (
              <span className="text-[10px] text-muted-foreground">بلا أيقونة</span>
            )}
          </div>
        );
      },
    },

    // 3. Name
    {
      accessorKey: "name",
      header: "اسم الخدمة",
      cell: ({ row }) => (
        <div className="flex flex-col text-right max-w-[200px] sm:max-w-xs">
          <span className="font-bold text-foreground truncate">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground truncate font-mono" dir="ltr">{row.original.slug}</span>
        </div>
      ),
    },

    // 4. Starting Price
    {
      accessorKey: "startingPrice",
      header: "السعر المبدئي",
      cell: ({ row }) => {
        const price = row.original.startingPrice;
        const currency = row.original.currency || "USD";
        const priceText = row.original.price;
        return (
          <div className="flex flex-col text-right">
            <span className="font-bold text-foreground">
              {price !== undefined && price !== null ? `${price} ${currency}` : "-"}
            </span>
            {priceText && <span className="text-[10px] text-muted-foreground">{priceText}</span>}
          </div>
        );
      },
    },

    // 5. Expected Duration
    {
      accessorKey: "duration",
      header: "مدة التسليم",
      cell: ({ row }) => (
        <span className="text-xs text-foreground font-medium">
          {row.original.duration || <span className="italic text-muted-foreground/45">بلا تحديد</span>}
        </span>
      ),
    },

    // 6. Reorder Arrows
    {
      id: "reorder",
      header: "الترتيب",
      cell: ({ row }) => {
        const service = row.original;
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onReorder?.(service, "up")}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="تحريك لأعلى"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onReorder?.(service, "down")}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="تحريك لأسفل"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },

    // 7. Publish status
    {
      accessorKey: "isPublished",
      header: "الحالة",
      filterFn: (row, columnId, filterValue) => {
        const isPublished = row.getValue(columnId);
        if (filterValue === "published") return isPublished === true;
        if (filterValue === "draft") return isPublished === false;
        return true;
      },
      cell: ({ row }) => {
        const isPublished = row.original.isPublished !== false;
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold select-none",
              isPublished ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
            )}
          >
            {isPublished ? "منشورة" : "مسودة"}
          </span>
        );
      },
    },

    // 8. Featured status
    {
      accessorKey: "isFeatured",
      header: "مميز",
      cell: ({ row }) => {
        const isFeatured = row.original.isFeatured === true;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold select-none",
              isFeatured ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
            )}
          >
            {isFeatured && <Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />}
            <span>{isFeatured ? "مميز" : "عادي"}</span>
          </span>
        );
      },
    },

    // 9. Actions
    {
      id: "actions",
      cell: ({ row }) => {
        const service = row.original;
        const id = service.id ?? service._id ?? "";

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
                    onClick={() => onEdit(service)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none select-none"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>تعديل الخدمة</span>
                  </DropdownMenuPrimitive.Item>

                  {/* Publish / Unpublish toggles */}
                  {onPublish && !service.isPublished && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onPublish(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 cursor-pointer outline-none select-none"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>نشر الخدمة</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  {onUnpublish && service.isPublished && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onUnpublish(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 cursor-pointer outline-none select-none"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>إلغاء النشر</span>
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
