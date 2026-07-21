"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/lib/api/types";

const statusLabels: Record<string, string> = { draft: "مسودة", in_review: "قيد المراجعة", changes_requested: "مطلوب تعديل", approved: "معتمد", scheduled: "مجدول", published: "منشور", archived: "مؤرشف" };

export const postColumnLabels = { title: "العنوان", status: "الحالة", category: "التصنيف", updatedAt: "آخر تعديل", publishedAt: "النشر", viewCount: "المشاهدات", isFeatured: "مميز", actions: "الإجراءات" };

export function createPostColumns({ onTrash, onRestore, onPermanent }: { onTrash: (id: string) => void; onRestore: (id: string) => void; onPermanent: (post: Post) => void }): ColumnDef<Post>[] {
  return [
    { accessorKey: "title", header: "العنوان", cell: ({ row }) => <div className="flex min-w-[280px] items-center gap-3">{row.original.featuredImage ? <Image src={row.original.featuredImage} alt="" width={56} height={40} className="h-10 w-14 rounded object-cover" /> : <div className="h-10 w-14 rounded bg-muted" />}<div><Link href={`/admin/blog/posts/${row.original.id ?? row.original._id}/edit`} className="font-bold hover:text-primary">{row.original.title}</Link><p className="font-mono text-[10px] text-muted-foreground">{row.original.slug}</p></div></div> },
    { accessorKey: "status", header: "الحالة", cell: ({ row }) => <span className="rounded-full bg-muted px-2 py-1 text-xs">{statusLabels[row.original.status ?? "draft"]}</span> },
    { id: "category", header: "التصنيف", cell: ({ row }) => typeof row.original.category === "object" ? row.original.category?.name : "—" },
    { accessorKey: "updatedAt", header: "آخر تعديل", cell: ({ row }) => row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString("ar-SA") : "—" },
    { accessorKey: "publishedAt", header: "النشر", cell: ({ row }) => row.original.scheduledAt ? `مجدول: ${new Date(row.original.scheduledAt).toLocaleString("ar-SA")}` : row.original.publishedAt ? new Date(row.original.publishedAt).toLocaleDateString("ar-SA") : "—" },
    { accessorKey: "viewCount", header: "المشاهدات", cell: ({ row }) => row.original.viewCount ?? 0 },
    { accessorKey: "isFeatured", header: "مميز", cell: ({ row }) => row.original.isFeatured ? "نعم" : "لا" },
    { id: "actions", header: "الإجراءات", cell: ({ row }) => { const id = String(row.original.id ?? row.original._id); return <div className="flex gap-2">{row.original.deletedAt ? <><button type="button" onClick={() => onRestore(id)} className="rounded border border-border px-2 py-1 text-xs">استعادة</button><button type="button" onClick={() => onPermanent(row.original)} className="rounded border border-danger/30 px-2 py-1 text-xs text-danger">حذف نهائي</button></> : <><Link href={`/admin/blog/posts/${id}/edit`} className="rounded border border-border px-2 py-1 text-xs">تحرير</Link><Link href={`/admin/blog/posts/${id}/revisions`} className="rounded border border-border px-2 py-1 text-xs">الإصدارات</Link><button type="button" onClick={() => onTrash(id)} className="rounded border border-danger/30 px-2 py-1 text-xs text-danger">سلة المحذوفات</button></>}</div>; } },
  ];
}
