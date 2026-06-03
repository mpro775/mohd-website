"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Globe, Star, Ban, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import type { Technology } from "@/lib/api/types";

export const technologyColumnLabels: Record<string, string> = {
  name: "اسم التقنية",
  category: "المجموعة الرئيسية",
  group: "المجموعة الفرعية",
  proficiencyLevel: "مستوى الخبرة",
  yearsOfExperience: "سنوات الخبرة",
  isPublished: "الحالة",
  highlighted: "مثبتة بالرئيسية",
};

interface CreateColumnsProps {
  onEdit: (tech: Technology) => void;
  onDelete: (id: string) => void;
  onPublish?: (id: string) => void;
  onUnpublish?: (id: string) => void;
  onReorder?: (tech: Technology, direction: "up" | "down") => void;
}

const proficiencyLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
  expert: "خبير",
};

const proficiencyColors: Record<string, string> = {
  beginner: "bg-blue-500/10 text-blue-500",
  intermediate: "bg-emerald-500/10 text-emerald-500",
  advanced: "bg-purple-500/10 text-purple-500",
  expert: "bg-rose-500/10 text-rose-500",
};

export function createTechnologyColumns({
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onReorder,
}: CreateColumnsProps): ColumnDef<Technology>[] {
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
      header: "شعار",
      cell: ({ row }) => {
        const iconUrl = row.original.icon;
        const color = row.original.color || "#4f46e5";
        return (
          <div
            className="h-9 w-9 rounded-lg border overflow-hidden flex items-center justify-center select-none shrink-0"
            style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
          >
            {iconUrl ? (
              <img src={iconUrl} alt="logo" className="h-6 w-6 object-contain" />
            ) : (
              <span className="text-[10px]" style={{ color }}>{row.original.name.substring(0, 2)}</span>
            )}
          </div>
        );
      },
    },

    // 3. Name & Color tag
    {
      accessorKey: "name",
      header: "اسم التقنية",
      cell: ({ row }) => {
        const color = row.original.color;
        return (
          <div className="flex flex-col text-right max-w-[180px]">
            <div className="flex items-center gap-1.5">
              {color && (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
              )}
              <span className="font-bold text-foreground truncate">{row.original.name}</span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate font-mono" dir="ltr">
              {row.original.slug}
            </span>
          </div>
        );
      },
    },

    // 4. Category & Group
    {
      accessorKey: "category",
      header: "المجموعة والنوع",
      cell: ({ row }) => {
        const group = row.original.group;
        return (
          <div className="flex flex-col text-right text-xs">
            <span className="font-semibold text-foreground">{row.original.category}</span>
            {group && <span className="text-[10px] text-muted-foreground">{group}</span>}
          </div>
        );
      },
    },

    // 5. Proficiency Level
    {
      accessorKey: "proficiencyLevel",
      header: "المستوى",
      cell: ({ row }) => {
        const level = row.original.proficiencyLevel || "intermediate";
        const label = proficiencyLabels[level] || level;
        const colorClass = proficiencyColors[level] || "bg-muted text-muted-foreground";
        return (
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold select-none", colorClass)}>
            {label}
          </span>
        );
      },
    },

    // 6. Years of Experience
    {
      accessorKey: "yearsOfExperience",
      header: "سنوات الخبرة",
      cell: ({ row }) => {
        const years = row.original.yearsOfExperience;
        return (
          <span className="text-xs font-semibold text-foreground font-mono">
            {years !== undefined && years !== null ? `${years} سنة` : "-"}
          </span>
        );
      },
    },

    // 7. Reorder
    {
      id: "reorder",
      header: "الترتيب",
      cell: ({ row }) => {
        const tech = row.original;
        return (
          <div className="flex gap-1">
            <button
              onClick={() => onReorder?.(tech, "up")}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              title="تحريك لأعلى"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onReorder?.(tech, "down")}
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
      filterFn: (row, columnId, filterValue) => {
        const isPublished = row.getValue(columnId);
        if (filterValue === "active") return isPublished === true;
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
            {isPublished ? "نشطة" : "مسودة"}
          </span>
        );
      },
    },

    // 9. Highlighted
    {
      accessorKey: "highlighted",
      header: "الرئيسية",
      cell: ({ row }) => {
        const highlighted = row.original.highlighted === true;
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold select-none",
              highlighted ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground"
            )}
          >
            {highlighted && <Star className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />}
            <span>{highlighted ? "مثبتة" : "عادية"}</span>
          </span>
        );
      },
    },

    // 10. Actions
    {
      id: "actions",
      cell: ({ row }) => {
        const tech = row.original;
        const id = tech.id ?? tech._id ?? "";

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
                    onClick={() => onEdit(tech)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none select-none"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>تعديل التقنية</span>
                  </DropdownMenuPrimitive.Item>

                  {/* External official URL link */}
                  {tech.officialUrl && (
                    <a
                      href={tech.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted outline-none select-none"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>الموقع الرسمي</span>
                    </a>
                  )}

                  {/* Publish / Unpublish toggles */}
                  {onPublish && !tech.isPublished && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onPublish(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 cursor-pointer outline-none select-none"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>تفعيل ونشر</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  {onUnpublish && tech.isPublished && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onUnpublish(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 cursor-pointer outline-none select-none"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      <span>إلغاء التفعيل</span>
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
