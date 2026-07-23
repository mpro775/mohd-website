"use client";

import Image from "next/image";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Edit3, Eye, MoreHorizontal, Star } from "lucide-react";
import type { AdminPostListItem } from "@/lib/api/types";
import { PostStatusBadge } from "./PostStatusBadge";

export function PostMobileCard({
  post,
  selected,
  onToggleSelected,
  onTrash,
  onRestore,
  onPermanent,
}: {
  post: AdminPostListItem;
  selected: boolean;
  onToggleSelected: () => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanent: (post: AdminPostListItem) => void;
}) {
  const id = String(post.id ?? post._id);
  const category = typeof post.category === "object" ? post.category?.name : undefined;
  return (
    <article className={`space-y-3 bg-card p-4 ${selected ? "bg-primary/5" : ""}`}>
      {post.featuredImage ? <Image src={post.featuredImage} alt="" width={640} height={320} className="aspect-[2/1] w-full rounded-xl object-cover" /> : <div className="aspect-[2/1] rounded-xl bg-muted" />}
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={onToggleSelected} aria-label={`تحديد ${post.title}`} className="mt-1" />
        <div className="min-w-0 flex-1">
          <Link href={`/admin/blog/posts/${id}/edit`} className="line-clamp-2 font-bold">{post.title}</Link>
          <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground" dir="ltr">/blog/{post.slug}</p>
        </div>
        {post.isFeatured ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-label="مقال مميز" /> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <PostStatusBadge status={post.status} />
        {category ? <span>{category}</span> : null}
        <span>·</span><span>{post.updatedAt ? new Date(post.updatedAt).toLocaleDateString("ar-SA") : "—"}</span>
        <span>·</span><span>{(post.viewCount ?? 0).toLocaleString("ar-SA")} مشاهدة</span>
      </div>
      <div className="flex items-center gap-2">
        <Link href={`/admin/blog/posts/${id}/edit`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"><Edit3 className="h-3.5 w-3.5" /> تحرير</Link>
        <Link href={`/admin/blog/posts/${id}/preview`} target="_blank" className="grid h-9 w-9 place-items-center rounded-lg border border-border" aria-label="معاينة"><Eye className="h-4 w-4" /></Link>
        <DropdownMenu.Root dir="rtl"><DropdownMenu.Trigger asChild><button type="button" className="grid h-9 w-9 place-items-center rounded-lg border border-border" aria-label="إجراءات المقال"><MoreHorizontal className="h-4 w-4" /></button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="z-50 min-w-44 rounded-xl border border-border bg-card p-1.5 text-xs font-bold shadow-xl">
          <DropdownMenu.Item asChild><Link href={`/admin/blog/posts/${id}/revisions`} className="block rounded-lg px-3 py-2 outline-none hover:bg-muted">سجل الإصدارات</Link></DropdownMenu.Item>
          {post.deletedAt ? <><DropdownMenu.Item onSelect={() => onRestore(id)} className="cursor-pointer rounded-lg px-3 py-2 outline-none hover:bg-muted">استعادة</DropdownMenu.Item><DropdownMenu.Item onSelect={() => onPermanent(post)} className="cursor-pointer rounded-lg px-3 py-2 text-danger outline-none hover:bg-danger/10">حذف نهائي</DropdownMenu.Item></> : <DropdownMenu.Item onSelect={() => onTrash(id)} className="cursor-pointer rounded-lg px-3 py-2 text-danger outline-none hover:bg-danger/10">نقل للسلة</DropdownMenu.Item>}
        </DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>
      </div>
    </article>
  );
}
