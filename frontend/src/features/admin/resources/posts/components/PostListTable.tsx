"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/admin/data-table/DataTable";
import type { AdminPostListItem } from "@/lib/api/types";
import { PostMobileCard } from "./PostMobileCard";

export function PostListTable({
  columns,
  data,
  loading,
  page,
  limit,
  total,
  totalPages,
  sortBy,
  sortOrder,
  onPageChange,
  onLimitChange,
  onSortChange,
  onBulkAction,
  onTrash,
  onRestore,
  onPermanent,
  emptyTitle,
  emptyDescription,
}: {
  columns: ColumnDef<AdminPostListItem>[];
  data: AdminPostListItem[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  onBulkAction: (action: string, ids: string[]) => void;
  onTrash: (id: string) => void;
  onRestore: (id: string) => void;
  onPermanent: (post: AdminPostListItem) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <DataTable
      serverSide
      hideToolbarSearch
      page={page}
      limit={limit}
      total={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      serverSortableColumns={["updatedAt", "publishedAt", "scheduledAt", "title", "viewCount", "readTime"]}
      columns={columns}
      data={data}
      isLoading={loading}
      searchKey="title"
      searchPlaceholder="ابحث في المقالات…"
      columnLabels={{ title: "المقال", status: "الحالة والجودة", organization: "التنظيم", performance: "الأداء", updatedAt: "آخر تعديل", actions: "الإجراءات" }}
      exportFilename="blog_posts"
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      bulkActions={[
        { action: "submit-review", label: "إرسال للمراجعة" },
        { action: "set-category", label: "تعيين تصنيف" },
        { action: "add-tag", label: "إضافة وسم" },
        { action: "archive", label: "أرشفة", variant: "warning" },
        { action: "delete", label: "نقل إلى السلة", variant: "danger" },
      ]}
      onBulkAction={onBulkAction}
      renderMobileItem={(post, selected, onToggleSelected) => <PostMobileCard post={post} selected={selected} onToggleSelected={onToggleSelected} onTrash={onTrash} onRestore={onRestore} onPermanent={onPermanent} />}
    />
  );
}
