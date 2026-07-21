"use client";

import type { ColumnDef } from "@tanstack/react-table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowDown, ArrowUp, BadgeCheck, Edit, ExternalLink, Eye, EyeOff, MoreHorizontal, Star, StarOff, Trash2 } from "lucide-react";
import type { Certification } from "@/lib/api/types";
import { formatSafeDate } from "@/lib/date-input";
import { cn } from "@/lib/utils";
import { CertificationValidityBadge } from "@/features/certifications/components/CertificationValidityBadge";

const typeLabels: Record<string, string> = {
  course: "دورة تدريبية", specialization: "تخصص", "professional-certificate": "شهادة مهنية", "professional-certification": "اعتماد مهني", license: "رخصة", bootcamp: "معسكر", workshop: "ورشة", attendance: "حضور", diploma: "دبلوم", award: "جائزة", other: "أخرى",
};

export const certificationColumnLabels = {
  title: "العنوان", type: "النوع", issuer: "الجهة المانحة", platform: "المنصة", issuedAt: "تاريخ الإصدار", validityStatus: "الصلاحية", isFeatured: "مميزة", isPublished: "النشر", order: "الترتيب",
};

type Props = {
  onEdit: (item: Certification) => void;
  onDelete: (id: string) => void;
  onAction: (id: string, action: "publish" | "unpublish" | "feature" | "unfeature") => void;
  onReorder: (item: Certification, direction: "up" | "down") => void;
};

export function createCertificationColumns({ onEdit, onDelete, onAction, onReorder }: Props): ColumnDef<Certification>[] {
  return [
    {
      id: "select",
      header: ({ table }) => <input aria-label="تحديد جميع الشهادات في الصفحة" type="checkbox" checked={table.getIsAllPageRowsSelected()} onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)} />,
      cell: ({ row }) => <input aria-label={`تحديد ${row.original.title}`} type="checkbox" checked={row.getIsSelected()} onChange={(event) => row.toggleSelected(event.target.checked)} />,
      enableSorting: false, enableHiding: false,
    },
    {
      id: "image", header: "الصورة", enableSorting: false,
      cell: ({ row }) => {
        const src = row.original.image || row.original.issuerLogo;
        return <div className="flex h-11 w-14 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/30">{src ? <img src={src} alt={`صورة ${row.original.title}`} className="h-full w-full object-contain" /> : <BadgeCheck className="h-5 w-5 text-muted-foreground" />}</div>;
      },
    },
    { accessorKey: "title", header: "العنوان", cell: ({ row }) => <div className="max-w-56"><p className="truncate font-bold">{row.original.title}</p><p dir="ltr" className="truncate font-mono text-[10px] text-muted-foreground">{row.original.slug}</p></div> },
    { accessorKey: "type", header: "النوع", cell: ({ row }) => <span className="text-xs font-semibold">{typeLabels[row.original.type] ?? row.original.type}</span> },
    { accessorKey: "issuer", header: "الجهة", cell: ({ row }) => <span className="text-xs">{row.original.issuer}</span> },
    { accessorKey: "platform", header: "المنصة", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.platform || "—"}</span> },
    { accessorKey: "issuedAt", header: "الإصدار", cell: ({ row }) => <span className="whitespace-nowrap text-xs">{formatSafeDate(row.original.issuedAt)}</span> },
    { accessorKey: "validityStatus", header: "الصلاحية", cell: ({ row }) => <CertificationValidityBadge status={row.original.validityStatus} /> },
    { accessorKey: "isFeatured", header: "مميزة", cell: ({ row }) => <span className={cn("inline-flex gap-1 rounded-full px-2 py-1 text-[11px] font-bold", row.original.isFeatured ? "bg-amber-500/10 text-amber-500" : "bg-muted text-muted-foreground")}>{row.original.isFeatured ? <Star className="h-3 w-3 fill-current" /> : null}{row.original.isFeatured ? "مميزة" : "عادية"}</span> },
    { accessorKey: "isPublished", header: "النشر", cell: ({ row }) => <span className={cn("rounded-full px-2 py-1 text-[11px] font-bold", row.original.isPublished ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground")}>{row.original.isPublished ? "منشورة" : "مسودة"}</span> },
    { accessorKey: "order", header: "الترتيب", cell: ({ row }) => <div className="flex items-center gap-1"><span className="w-6 text-center text-xs">{row.original.order ?? 0}</span><button type="button" aria-label="تحريك لأعلى" onClick={() => onReorder(row.original, "up")} className="rounded p-1 hover:bg-muted"><ArrowUp className="h-3.5 w-3.5" /></button><button type="button" aria-label="تحريك لأسفل" onClick={() => onReorder(row.original, "down")} className="rounded p-1 hover:bg-muted"><ArrowDown className="h-3.5 w-3.5" /></button></div> },
    {
      id: "actions", enableSorting: false, enableHiding: false,
      cell: ({ row }) => {
        const item = row.original; const id = item.id ?? item._id ?? "";
        return <DropdownMenu.Root><DropdownMenu.Trigger asChild><button type="button" aria-label={`إجراءات ${item.title}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border"><MoreHorizontal className="h-4 w-4" /></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content align="start" className="z-50 min-w-48 rounded-xl border border-border bg-card p-1.5 text-xs shadow-xl">
          <DropdownMenu.Item onSelect={() => onEdit(item)} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-muted"><Edit className="h-3.5 w-3.5" />تعديل</DropdownMenu.Item>
          {item.isPublished ? <a href={`/certifications/${item.slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" />العرض العام<span className="sr-only"> (يفتح نافذة جديدة)</span></a> : null}
          {item.credentialUrl ? <a href={item.credentialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-muted"><BadgeCheck className="h-3.5 w-3.5" />التحقق<span className="sr-only"> (يفتح نافذة جديدة)</span></a> : null}
          <DropdownMenu.Item onSelect={() => onAction(id, item.isPublished ? "unpublish" : "publish")} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-muted">{item.isPublished ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}{item.isPublished ? "إلغاء النشر" : "نشر"}</DropdownMenu.Item>
          <DropdownMenu.Item onSelect={() => onAction(id, item.isFeatured ? "unfeature" : "feature")} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none hover:bg-muted">{item.isFeatured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}{item.isFeatured ? "إلغاء الإبراز" : "إبراز"}</DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item onSelect={() => onDelete(id)} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-danger outline-none hover:bg-danger/10"><Trash2 className="h-3.5 w-3.5" />حذف</DropdownMenu.Item>
        </DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>;
      },
    },
  ];
}
