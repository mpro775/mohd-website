"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Globe, Star, Ban, ArrowUp, ArrowDown, ExternalLink, MousePointerClick } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import type { LinkItem } from "@/lib/api/types";

export const linkColumnLabels: Record<string, string> = {
  title: "اسم الرابط / العنوان",
  url: "العنوان الكامل URL",
  platform: "المنصة",
  category: "التصنيف",
  clicks: "النقرات",
  isPublished: "الحالة",
  isFeatured: "تمييز الرابط",
};

interface CreateColumnsProps {
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onReorder?: (link: LinkItem, direction: "up" | "down") => void;
}

export function createLinkColumns({
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onReorder,
}: CreateColumnsProps): ColumnDef<LinkItem>[] {
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

    // 2. Icon/Avatar
    {
      id: "icon",
      header: "أيقونة",
      cell: ({ row }) => {
        const iconUrl = row.original.icon;
        return (
          <div className="h-8 w-8 rounded-lg border border-border overflow-hidden bg-muted/40 flex items-center justify-center shrink-0">
            {iconUrl ? (
              <img src={iconUrl} alt="icon" className="h-5 w-5 object-contain" />
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">
                {row.original.title.substring(0, 1).toUpperCase()}
              </span>
            )}
          </div>
        );
      },
    },

    // 3. Title & Platform
    {
      accessorKey: "title",
      header: "عنوان الرابط",
      cell: ({ row }) => {
        const platform = row.original.platform;
        return (
          <div className="flex flex-col text-right max-w-[200px]">
            <span className="font-bold text-foreground truncate">{row.original.title}</span>
            {platform && (
              <span className="text-[10px] text-muted-foreground font-mono truncate" dir="ltr">
                @{platform}
              </span>
            )}
          </div>
        );
      },
    },

    // 4. URL
    {
      accessorKey: "url",
      header: "رابط الوجهة URL",
      cell: ({ row }) => {
        const url = row.original.url;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-mono"
            dir="ltr"
          >
            <span className="truncate max-w-[180px]">{url}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        );
      },
    },

    // 5. Clicks Stat
    {
      accessorKey: "clicks",
      header: "النقرات",
      cell: ({ row }) => {
        const clicks = row.original.clicks || 0;
        return (
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-foreground font-mono bg-muted/30 px-2 py-0.5 rounded border border-border/20">
            <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{clicks}</span>
          </div>
        );
      },
    },

    // 6. Category
    {
      accessorKey: "category",
      header: "التصنيف",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-foreground bg-secondary/15 px-2 py-0.5 rounded">
          {row.original.category || <span className="text-muted-foreground/45 italic">عام</span>}
        </span>
      ),
    },

    // 7. Reorder
    {
      id: "reorder",
      header: "الترتيب",
      cell: ({ row }) => {
        const link = row.original;
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onReorder?.(link, "up")}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="تحريك لأعلى"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onReorder?.(link, "down")}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="تحريك لأسفل"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },

    // 8. Publish Status
    {
      accessorKey: "isPublished",
      header: "الحالة",
      cell: ({ row }) => {
        const isPublished = row.original.isPublished !== false;
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold select-none",
              isPublished ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
            )}
          >
            {isPublished ? "نشط" : "مسودة"}
          </span>
        );
      },
    },

    // 9. Featured Status
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

    // 10. Actions
    {
      id: "actions",
      cell: ({ row }) => {
        const link = row.original;
        const id = link.id ?? link._id ?? "";

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
                    onClick={() => onEdit(link)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none select-none"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>تعديل الرابط</span>
                  </DropdownMenuPrimitive.Item>

                  {/* Visit */}
                  <DropdownMenuPrimitive.Item asChild>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted outline-none select-none"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>زيارة الرابط</span>
                    </a>
                  </DropdownMenuPrimitive.Item>

                  {/* Publish / Unpublish toggles */}
                  {onPublish && !link.isPublished && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onPublish(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 cursor-pointer outline-none select-none"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>تنشيط الرابط</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  {onUnpublish && link.isPublished && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onUnpublish(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 cursor-pointer outline-none select-none"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>إلغاء التنشيط</span>
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
