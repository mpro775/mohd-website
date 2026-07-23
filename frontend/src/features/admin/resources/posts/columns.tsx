"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AlertTriangle, Eye, MoreHorizontal, Star } from "lucide-react";
import { toast } from "sonner";
import type { AdminPostListItem, Tag } from "@/lib/api/types";
import { PostStatusBadge } from "./components/PostStatusBadge";

export const postColumnLabels = {
  title: "المقال",
  status: "الحالة والجودة",
  organization: "التنظيم",
  performance: "الأداء",
  updatedAt: "آخر تعديل",
  actions: "الإجراءات",
};

export function createPostColumns({
  onTrash,
  onRestore,
  onPermanent,
}: {
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanent: (post: AdminPostListItem) => void;
}): ColumnDef<AdminPostListItem>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="تحديد كل المقالات في الصفحة"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`تحديد ${row.original.title}`}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: "المقال",
      cell: ({ row }) => {
        const post = row.original;
        const id = post.id ?? post._id;
        return (
          <div className="flex min-w-[310px] items-center gap-3">
            {post.featuredImage ? (
              <Image src={post.featuredImage} alt="" width={72} height={48} className="h-12 w-[72px] rounded-lg object-cover" />
            ) : (
              <div className="h-12 w-[72px] rounded-lg bg-muted" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Link href={`/admin/blog/posts/${id}/edit`} className="max-w-[260px] truncate font-bold hover:text-primary">{post.title}</Link>
                {post.isFeatured ? <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-label="مقال مميز" /> : null}
              </div>
              <p className="mt-1 max-w-[260px] truncate font-mono text-[10px] text-muted-foreground" dir="ltr">/blog/{post.slug}</p>
              {post.excerpt ? <p className="mt-1 max-w-[280px] truncate text-[11px] text-muted-foreground">{post.excerpt}</p> : null}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "الحالة والجودة",
      cell: ({ row }) => (
        <div className="space-y-2">
          <PostStatusBadge status={row.original.status} />
          {(row.original as AdminPostListItem & { hasWarnings?: boolean }).hasWarnings ? (
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500" title="المقال يحتاج انتباه">
              <AlertTriangle className="h-3.5 w-3.5" /> يحتاج انتباه
            </span>
          ) : null}
        </div>
      ),
    },
    {
      id: "organization",
      header: "التنظيم",
      cell: ({ row }) => {
        const category = typeof row.original.category === "object" ? row.original.category?.name : null;
        const tags = (row.original.tags ?? []).filter((tag): tag is Tag => typeof tag === "object");
        return (
          <div className="min-w-32 space-y-1">
            <p className="text-xs font-bold">{category ?? "غير مصنف"}</p>
            {tags.length ? <div className="flex flex-wrap gap-1">{tags.slice(0, 2).map((tag) => <span key={tag.id ?? tag._id ?? tag.slug} className="rounded-full bg-muted px-2 py-0.5 text-[10px]">{tag.name}</span>)}{tags.length > 2 ? <span className="text-[10px] text-muted-foreground">+{tags.length - 2}</span> : null}</div> : null}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "performance",
      header: "الأداء",
      cell: ({ row }) => (
        <div className="space-y-1 text-xs">
          <p>{(row.original.viewCount ?? 0).toLocaleString("ar-SA")} مشاهدة</p>
          <p className="text-muted-foreground">{row.original.readTime ?? "—"} دقائق قراءة</p>
          {row.original.scheduledAt ? <p className="text-violet-500">{new Date(row.original.scheduledAt).toLocaleDateString("ar-SA")}</p> : row.original.publishedAt ? <p className="text-muted-foreground">{new Date(row.original.publishedAt).toLocaleDateString("ar-SA")}</p> : null}
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "updatedAt",
      header: "آخر تعديل",
      cell: ({ row }) => row.original.updatedAt ? <time className="whitespace-nowrap text-xs">{new Date(row.original.updatedAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}</time> : "—",
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const post = row.original;
        const id = String(post.id ?? post._id);
        return (
          <div className="flex items-center justify-end gap-1">
            <Link href={`/admin/blog/posts/${id}/preview`} target="_blank" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="معاينة المقال"><Eye className="h-4 w-4" /></Link>
            <DropdownMenu.Root dir="rtl">
              <DropdownMenu.Trigger asChild><button type="button" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="إجراءات المقال"><MoreHorizontal className="h-4 w-4" /></button></DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-44 rounded-xl border border-border bg-card p-1.5 text-xs font-bold shadow-xl">
                  <DropdownMenu.Item asChild><Link href={`/admin/blog/posts/${id}/edit`} className="block rounded-lg px-3 py-2 outline-none hover:bg-muted">تحرير</Link></DropdownMenu.Item>
                  <DropdownMenu.Item asChild><Link href={`/admin/blog/posts/${id}/preview`} target="_blank" className="block rounded-lg px-3 py-2 outline-none hover:bg-muted">معاينة</Link></DropdownMenu.Item>
                  <DropdownMenu.Item asChild><Link href={`/admin/blog/posts/${id}/revisions`} className="block rounded-lg px-3 py-2 outline-none hover:bg-muted">سجل الإصدارات</Link></DropdownMenu.Item>
                  {post.status === "published" ? <DropdownMenu.Item onSelect={() => { void navigator.clipboard.writeText(`${window.location.origin}/blog/${post.slug}`); toast.success("تم نسخ الرابط"); }} className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-muted">نسخ الرابط</DropdownMenu.Item> : null}
                  {post.deletedAt ? (
                    <>
                      <DropdownMenu.Item onSelect={() => onRestore(id)} className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-muted">استعادة</DropdownMenu.Item>
                      <DropdownMenu.Item onSelect={() => onPermanent(post)} className="cursor-pointer rounded-lg px-3 py-2 text-danger outline-none hover:bg-danger/10">حذف نهائي</DropdownMenu.Item>
                    </>
                  ) : (
                    <DropdownMenu.Item onSelect={() => onTrash(id)} className="cursor-pointer rounded-lg px-3 py-2 text-danger outline-none hover:bg-danger/10">نقل إلى السلة</DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        );
      },
    },
  ];
}
