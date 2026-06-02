"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Globe, Eye, Archive, Ban } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Post, Category } from "@/lib/api/types";

// Translation labels mapper
export const postColumnLabels: Record<string, string> = {
  title: "عنوان المقال",
  categoryName: "التصنيف",
  status: "الحالة",
  publishDate: "تاريخ النشر",
  views: "المشاهدات",
};

interface CreateColumnsProps {
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function createPostColumns({
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onArchive,
}: CreateColumnsProps): ColumnDef<Post>[] {
  return [
    // 1. Row selection checkbox
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

    // 2. Featured Image Thumbnail
    {
      id: "image",
      header: "الصورة",
      cell: ({ row }) => {
        const imageUrl = row.original.featuredImage || row.original.coverImage;
        return (
          <div className="h-10 w-16 rounded border border-border overflow-hidden bg-muted/40 flex items-center justify-center select-none shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt="thumbnail" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] text-muted-foreground">بلا صورة</span>
            )}
          </div>
        );
      },
    },

    // 3. Title
    {
      accessorKey: "title",
      header: "عنوان المقال",
      cell: ({ row }) => (
        <div className="flex flex-col text-right max-w-[200px] sm:max-w-xs">
          <span className="font-bold text-foreground truncate">{row.original.title}</span>
          <span className="text-[10px] text-muted-foreground truncate" dir="ltr">{row.original.slug}</span>
        </div>
      ),
    },

    // 4. Category
    {
      id: "categoryName",
      accessorFn: (row) => {
        const cat = row.category;
        if (!cat) return "بلا تصنيف";
        return typeof cat === "string" ? cat : (cat as Category).name;
      },
      header: "التصنيف",
      cell: ({ getValue }) => (
        <span className="inline-flex items-center rounded-full bg-secondary/15 px-2.5 py-0.5 text-xs font-bold text-secondary">
          {getValue() as string}
        </span>
      ),
    },

    // 5. Status Badge
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.original.status || "draft";
        
        const getStatusStyles = () => {
          switch (status) {
            case "published":
              return "bg-emerald-500/10 text-emerald-500";
            case "scheduled":
              return "bg-amber-500/10 text-amber-500";
            case "archived":
              return "bg-rose-500/10 text-rose-500";
            default: // draft
              return "bg-muted text-muted-foreground";
          }
        };

        const getStatusLabel = () => {
          switch (status) {
            case "published":
              return "منشور";
            case "scheduled":
              return "مجدول";
            case "archived":
              return "مؤرشف";
            default:
              return "مسودة";
          }
        };

        return (
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", getStatusStyles())}>
            {getStatusLabel()}
          </span>
        );
      },
    },

    // 6. Publish Date
    {
      accessorKey: "publishDate",
      header: "تاريخ النشر",
      cell: ({ row }) => {
        const date = row.original.publishDate || row.original.createdAt;
        return <span className="text-xs font-semibold text-muted-foreground">{formatDate(date)}</span>;
      },
    },

    // 7. Views
    {
      accessorKey: "views",
      header: "المشاهدات",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-foreground flex items-center gap-1" dir="ltr">
          <Eye className="h-3.5 w-3.5 opacity-60" />
          <span>{row.original.views ?? 0}</span>
        </span>
      ),
    },

    // 8. Actions column
    {
      id: "actions",
      cell: ({ row }) => {
        const post = row.original;
        const id = post.id ?? post._id ?? "";
        
        return (
          <DropdownMenuPrimitive.Root>
            <DropdownMenuPrimitive.Trigger asChild>
              <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none outline-none">
                <MoreHorizontal className="h-4.5 w-4.5" />
              </button>
            </DropdownMenuPrimitive.Trigger>

            <DropdownMenuPrimitive.Portal>
              <DropdownMenuPrimitive.Content
                className="z-50 min-w-[150px] overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95"
                align="start"
              >
                <div className="space-y-0.5">
                  {/* Edit */}
                  <DropdownMenuPrimitive.Item
                    onClick={() => onEdit(post)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none select-none"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>تعديل المقال</span>
                  </DropdownMenuPrimitive.Item>

                  {/* Publish / Unpublish / Archive action toggles */}
                  {onPublish && post.status !== "published" && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onPublish(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 cursor-pointer outline-none select-none"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>نشر المقال</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  {onUnpublish && post.status === "published" && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onUnpublish(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 cursor-pointer outline-none select-none"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>إلغاء النشر</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  {onArchive && post.status !== "archived" && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onArchive(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none select-none"
                    >
                      <Archive className="h-3.5 w-3.5" />
                      <span>أرشفة المقال</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  {/* Divider line */}
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
