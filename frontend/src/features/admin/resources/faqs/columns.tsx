"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Globe, Star, Ban, ArrowUp, ArrowDown } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import type { Faq } from "@/lib/api/types";

export const faqColumnLabels: Record<string, string> = {
  question: "السؤال الفعلي",
  answer: "الإجابة الكاملة",
  category: "التصنيف",
  isPublished: "الحالة",
  isFeatured: "مميز بالرئيسية",
};

interface CreateColumnsProps {
  onEdit: (faq: Faq) => void;
  onDelete: (id: string) => void;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onReorder?: (faq: Faq, direction: "up" | "down") => void;
}

export function createFaqColumns({
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onReorder,
}: CreateColumnsProps): ColumnDef<Faq>[] {
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

    // 2. Question
    {
      accessorKey: "question",
      header: "السؤال الشائع",
      cell: ({ row }) => (
        <div className="flex flex-col text-right max-w-xs sm:max-w-md">
          <span className="font-bold text-foreground truncate">{row.original.question}</span>
        </div>
      ),
    },

    // 3. Answer preview
    {
      accessorKey: "answer",
      header: "مقتطف من الإجابة",
      cell: ({ row }) => {
        const text = row.original.answer || "";
        return (
          <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
            {text}
          </span>
        );
      },
    },

    // 4. Category
    {
      accessorKey: "category",
      header: "التصنيف",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded select-none">
          {row.original.category || <span className="italic text-muted-foreground/40 font-normal">عام</span>}
        </span>
      ),
    },

    // 5. Reorder
    {
      id: "reorder",
      header: "الترتيب",
      cell: ({ row }) => {
        const faq = row.original;
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onReorder?.(faq, "up")}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="تحريك لأعلى"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onReorder?.(faq, "down")}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="تحريك لأسفل"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },

    // 6. Publish Status
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
            {isPublished ? "منشور" : "مسودة"}
          </span>
        );
      },
    },

    // 7. Featured Status
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

    // 8. Actions
    {
      id: "actions",
      cell: ({ row }) => {
        const faq = row.original;
        const id = faq.id ?? faq._id ?? "";

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
                    onClick={() => onEdit(faq)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none select-none"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>تعديل السؤال</span>
                  </DropdownMenuPrimitive.Item>

                  {/* Publish / Unpublish toggles */}
                  {onPublish && !faq.isPublished && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onPublish(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 cursor-pointer outline-none select-none"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>نشر السؤال</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  {onUnpublish && faq.isPublished && (
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
