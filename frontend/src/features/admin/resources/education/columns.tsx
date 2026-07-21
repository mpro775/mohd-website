"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowDown, ArrowUp, Edit, ExternalLink, Eye, EyeOff, GraduationCap, MoreHorizontal, Star, StarOff, Trash2 } from "lucide-react";
import type { Education } from "@/lib/api/types";
import { toDateInputValue } from "@/lib/date-input";
import { cn } from "@/lib/utils";

const degreeLabels: Record<string, string> = { "high-school": "ثانوية عامة", diploma: "دبلوم", associate: "درجة مشاركة", bachelor: "بكالوريوس", master: "ماجستير", doctorate: "دكتوراه", postgraduate: "دراسات عليا", "professional-degree": "درجة مهنية", other: "أخرى" };
const year = (value?: string) => toDateInputValue(value).slice(0, 4) || "غير محدد";

export const educationColumnLabels = { degree: "الدرجة", institution: "المؤسسة", fieldOfStudy: "التخصص", degreeType: "نوع الدرجة", startDate: "الفترة", isCurrent: "الحالة", isFeatured: "مميز", isPublished: "النشر", order: "الترتيب" };

type Props = {
  onEdit: (item: Education) => void;
  onDelete: (id: string) => void;
  onAction: (id: string, action: "publish" | "unpublish" | "feature" | "unfeature") => void;
  onReorder: (item: Education, direction: "up" | "down") => void;
};

export function createEducationColumns({ onEdit, onDelete, onAction, onReorder }: Props): ColumnDef<Education>[] {
  return [
    { id: "select", header: ({ table }) => <input aria-label="تحديد جميع المؤهلات في الصفحة" type="checkbox" checked={table.getIsAllPageRowsSelected()} onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)} />, cell: ({ row }) => <input aria-label={`تحديد ${row.original.degree}`} type="checkbox" checked={row.getIsSelected()} onChange={(event) => row.toggleSelected(event.target.checked)} />, enableSorting: false, enableHiding: false },
    { id: "logo", header: "الشعار", enableSorting: false, cell: ({ row }) => <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">{row.original.institutionLogo ? <img src={row.original.institutionLogo} alt={`شعار ${row.original.institution}`} className="h-full w-full object-contain" /> : <GraduationCap className="h-5 w-5 text-muted-foreground" />}</div> },
    { accessorKey: "degree", header: "الدرجة", cell: ({ row }) => <div className="max-w-56"><p className="truncate font-bold">{row.original.degree}</p><p dir="ltr" className="truncate font-mono text-[10px] text-muted-foreground">{row.original.slug}</p></div> },
    { accessorKey: "institution", header: "المؤسسة", cell: ({ row }) => <span className="text-xs font-semibold">{row.original.institution}</span> },
    { accessorKey: "fieldOfStudy", header: "التخصص", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.fieldOfStudy || "—"}</span> },
    { accessorKey: "degreeType", header: "النوع", cell: ({ row }) => <span className="text-xs">{degreeLabels[row.original.degreeType] ?? row.original.degreeType}</span> },
    { accessorKey: "startDate", header: "الفترة", cell: ({ row }) => <span dir="ltr" className="whitespace-nowrap text-xs">{year(row.original.startDate)} — {row.original.isCurrent ? "حتى الآن" : year(row.original.endDate)}</span> },
    { accessorKey: "isCurrent", header: "الحالة", cell: ({ row }) => <span className={cn("rounded-full px-2 py-1 text-[11px] font-bold", row.original.isCurrent ? "bg-sky-500/10 text-sky-500" : "bg-muted text-muted-foreground")}>{row.original.isCurrent ? "حاليًا" : "مكتمل"}</span> },
    { accessorKey: "isFeatured", header: "مميز", cell: ({ row }) => <span className={cn("rounded-full px-2 py-1 text-[11px] font-bold", row.original.isFeatured ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground")}>{row.original.isFeatured ? "مميز" : "عادي"}</span> },
    { accessorKey: "isPublished", header: "النشر", cell: ({ row }) => <span className={cn("rounded-full px-2 py-1 text-[11px] font-bold", row.original.isPublished ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground")}>{row.original.isPublished ? "منشور" : "مسودة"}</span> },
    { accessorKey: "order", header: "الترتيب", cell: ({ row }) => <div className="flex items-center gap-1"><span className="w-6 text-center text-xs">{row.original.order ?? 0}</span><button type="button" aria-label="تحريك لأعلى" onClick={() => onReorder(row.original, "up")} className="rounded p-1 hover:bg-muted"><ArrowUp className="h-3.5 w-3.5" /></button><button type="button" aria-label="تحريك لأسفل" onClick={() => onReorder(row.original, "down")} className="rounded p-1 hover:bg-muted"><ArrowDown className="h-3.5 w-3.5" /></button></div> },
    { id: "actions", enableSorting: false, enableHiding: false, cell: ({ row }) => { const item = row.original; const id = item.id ?? item._id ?? ""; return <DropdownMenu.Root><DropdownMenu.Trigger asChild><button type="button" aria-label={`إجراءات ${item.degree}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border"><MoreHorizontal className="h-4 w-4" /></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="start" className="z-50 min-w-48 rounded-xl border border-border bg-card p-1.5 text-xs shadow-xl">
      <DropdownMenu.Item onSelect={() => onEdit(item)} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-muted"><Edit className="h-3.5 w-3.5" />تعديل</DropdownMenu.Item>
      {item.isPublished ? <a href={`/education/${item.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" />العرض العام<span className="sr-only"> (يفتح نافذة جديدة)</span></a> : null}
      <DropdownMenu.Item onSelect={() => onAction(id, item.isPublished ? "unpublish" : "publish")} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-muted">{item.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{item.isPublished ? "إلغاء النشر" : "نشر"}</DropdownMenu.Item>
      <DropdownMenu.Item onSelect={() => onAction(id, item.isFeatured ? "unfeature" : "feature")} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-muted">{item.isFeatured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}{item.isFeatured ? "إلغاء الإبراز" : "إبراز"}</DropdownMenu.Item>
      <DropdownMenu.Separator className="my-1 h-px bg-border" /><DropdownMenu.Item onSelect={() => onDelete(id)} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-danger outline-none hover:bg-danger/10"><Trash2 className="h-3.5 w-3.5" />حذف</DropdownMenu.Item>
    </DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>; } },
  ];
}
