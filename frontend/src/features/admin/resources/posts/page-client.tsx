"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { useQueryStates } from "nuqs";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminClient, clientApiRequest } from "@/lib/api/admin-client";
import { adminQueryKeys } from "@/lib/api/admin-query-keys";
import { adminSearchParamsSchema } from "@/lib/api/admin-search-params";
import type { AdminPostListItem } from "@/lib/api/types";
import { createPostColumns } from "./columns";
import { PostBulkCategoryDialog } from "./components/PostBulkCategoryDialog";
import { PostBulkTagDialog } from "./components/PostBulkTagDialog";
import { PostFiltersBar } from "./components/PostFiltersBar";
import { PostListTable } from "./components/PostListTable";
import { PostStatsOverview } from "./components/PostStatsOverview";
import { PostStatusTabs } from "./components/PostStatusTabs";
import { buildBulkTaxonomyPayload, matchesPermanentDeleteTitle } from "./post-list-actions";

export function PostsPageClient() {
  const [query, setQuery] = useQueryStates(adminSearchParamsSchema);
  const queryClient = useQueryClient();
  const [trashTarget, setTrashTarget] = useState<string | null>(null);
  const [permanentTarget, setPermanentTarget] = useState<AdminPostListItem | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [bulkIds, setBulkIds] = useState<string[]>([]);
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
  const [bulkTagOpen, setBulkTagOpen] = useState(false);
  const [bulkConfirmAction, setBulkConfirmAction] = useState<string | null>(null);

  const posts = useQuery({
    queryKey: adminQueryKeys.resource("blog/posts", query),
    queryFn: () => adminClient.listResource<AdminPostListItem>("blog/posts", {
      page: query.page,
      limit: query.limit,
      search: query.search || undefined,
      status: query.status === "all" ? undefined : query.status,
      category: query.category || undefined,
      author: query.author || undefined,
      featured: query.isFeatured === "all" ? undefined : query.isFeatured === "true",
      trash: query.trash === "all" ? undefined : query.trash === "true",
      hasWarnings: query.hasWarnings === "all" ? undefined : query.hasWarnings === "true",
      dateFrom: query.dateFrom || undefined,
      dateTo: query.dateTo || undefined,
      sortBy: query.sortBy || "updatedAt",
      sortOrder: query.sortOrder || "desc",
    }),
  });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("blog/posts") });
  const trash = useMutation({
    mutationFn: (id: string) => clientApiRequest(`/blog/posts/${id}/trash`, { method: "POST" }),
    onSuccess: () => { toast.success("تم نقل المقال إلى سلة المحذوفات"); setTrashTarget(null); void invalidate(); },
    onError: () => toast.error("تعذر نقل المقال"),
  });
  const restore = useMutation({
    mutationFn: (id: string) => clientApiRequest(`/blog/posts/${id}/restore`, { method: "POST" }),
    onSuccess: () => { toast.success("تمت استعادة المقال"); void invalidate(); },
    onError: () => toast.error("تعذرت استعادة المقال"),
  });
  const permanent = useMutation({
    mutationFn: ({ id, confirmation: value }: { id: string; confirmation: string }) => clientApiRequest(`/blog/posts/${id}/permanent`, { method: "DELETE", body: { confirmation: value } }),
    onSuccess: () => { toast.success("تم الحذف النهائي"); setPermanentTarget(null); setConfirmation(""); void invalidate(); },
    onError: () => toast.error("تعذر الحذف النهائي"),
  });
  const bulk = useMutation({
    mutationFn: ({ action, ids, data }: { action: string; ids: string[]; data?: unknown }) => adminClient.bulkAction("blog/posts", action, ids, data),
    onSuccess: () => { toast.success("اكتمل الإجراء الجماعي"); setBulkIds([]); setBulkConfirmAction(null); setBulkCategoryOpen(false); setBulkTagOpen(false); void invalidate(); },
    onError: () => toast.error("تعذر إكمال الإجراء الجماعي"),
  });

  const columns = useMemo(() => createPostColumns({
    onTrash: setTrashTarget,
    onRestore: (id) => restore.mutate(id),
    onPermanent: (post) => { setPermanentTarget(post); setConfirmation(""); },
  }), [restore]);

  const updateFilters = (patch: Record<string, string | number | undefined>) => {
    void setQuery({ ...patch, page: 1 });
  };
  const resetFilters = () => {
    void setQuery({
      page: 1,
      search: "",
      category: "",
      author: "",
      isFeatured: "all",
      hasWarnings: "all",
      dateFrom: "",
      dateTo: "",
      sortBy: "updatedAt",
      sortOrder: "desc",
    });
  };
  const handleBulk = (action: string, ids: string[]) => {
    if (!ids.length) return;
    setBulkIds(ids);
    if (action === "set-category") setBulkCategoryOpen(true);
    else if (action === "add-tag") setBulkTagOpen(true);
    else if (action === "archive" || action === "delete") setBulkConfirmAction(action);
    else bulk.mutate({ action, ids });
  };
  const hasFilters = Boolean(query.search || query.category || query.author || query.isFeatured !== "all" || query.hasWarnings !== "all" || query.dateFrom || query.dateTo);

  return (
    <div className="space-y-5" dir="rtl">
      <AdminPageHeader title="إدارة المقالات" description="تابع حالة المحتوى، وابحث بسرعة، وانتقل إلى الكتابة دون ضوضاء.">
        <button type="button" onClick={() => void posts.refetch()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs"><RefreshCw className={`h-4 w-4 ${posts.isRefetching ? "animate-spin" : ""}`} />تحديث</button>
        <Link href="/admin/blog/posts/new" className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 font-bold text-primary-foreground"><Plus className="h-4 w-4" />مقال جديد</Link>
      </AdminPageHeader>

      <PostStatsOverview onSelect={(key) => {
        if (key === "warnings") void setQuery({ hasWarnings: "true", status: "all", trash: "all", page: 1 });
        else void setQuery({ status: key === "all" ? "all" : key, hasWarnings: "all", trash: "all", page: 1 });
      }} />
      <PostStatusTabs status={query.status} trash={query.trash} onChange={(status, trashValue) => void setQuery({ status, trash: trashValue, page: 1 })} />
      <PostFiltersBar
        values={{
          search: query.search,
          category: query.category,
          author: query.author,
          isFeatured: query.isFeatured,
          hasWarnings: query.hasWarnings,
          dateFrom: query.dateFrom,
          dateTo: query.dateTo,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
        }}
        onChange={(patch) => updateFilters(patch)}
        onReset={resetFilters}
      />

      {posts.isError ? (
        <div className="rounded-2xl border border-danger/30 bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-danger" />
          <h2 className="mt-3 font-bold">تعذر تحميل المقالات</h2>
          <p className="mt-1 text-sm text-muted-foreground">حاول تحديث البيانات مرة أخرى.</p>
          <button type="button" onClick={() => void posts.refetch()} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">إعادة المحاولة</button>
        </div>
      ) : (
        <PostListTable
          columns={columns}
          data={posts.data?.items ?? []}
          loading={posts.isLoading}
          page={posts.data?.meta.page ?? query.page}
          limit={posts.data?.meta.limit ?? query.limit}
          total={posts.data?.meta.total ?? 0}
          totalPages={posts.data?.meta.totalPages ?? 1}
          sortBy={query.sortBy}
          sortOrder={query.sortOrder as "asc" | "desc"}
          onPageChange={(page) => void setQuery({ page })}
          onLimitChange={(limit) => void setQuery({ limit, page: 1 })}
          onSortChange={(sortBy, sortOrder) => void setQuery({ sortBy, sortOrder, page: 1 })}
          onBulkAction={handleBulk}
          onTrash={setTrashTarget}
          onRestore={(id) => restore.mutate(id)}
          onPermanent={(post) => { setPermanentTarget(post); setConfirmation(""); }}
          emptyTitle={query.trash === "true" ? "سلة المحذوفات فارغة" : hasFilters ? "لا توجد نتائج مطابقة" : "لا توجد مقالات بعد"}
          emptyDescription={hasFilters ? "جرّب إزالة بعض الفلاتر أو مسحها بالكامل." : "ابدأ بإنشاء أول مقال في استوديو الكتابة."}
        />
      )}

      <ConfirmDialog isOpen={Boolean(trashTarget)} onClose={() => setTrashTarget(null)} onConfirm={async () => { if (trashTarget) await trash.mutateAsync(trashTarget); }} title="نقل المقال إلى السلة" description="يمكنك استعادة المقال من سلة المحذوفات لاحقًا." confirmText="نقل إلى السلة" isSubmitting={trash.isPending} />
      <PostBulkCategoryDialog open={bulkCategoryOpen} onOpenChange={setBulkCategoryOpen} count={bulkIds.length} busy={bulk.isPending} onConfirm={(categoryId) => { const payload = buildBulkTaxonomyPayload("category", bulkIds, categoryId); if (payload) bulk.mutate(payload); }} />
      <PostBulkTagDialog open={bulkTagOpen} onOpenChange={setBulkTagOpen} count={bulkIds.length} busy={bulk.isPending} onConfirm={(tagId) => { const payload = buildBulkTaxonomyPayload("tag", bulkIds, tagId); if (payload) bulk.mutate(payload); }} />
      <ConfirmDialog isOpen={Boolean(bulkConfirmAction)} onClose={() => setBulkConfirmAction(null)} onConfirm={async () => { if (bulkConfirmAction) await bulk.mutateAsync({ action: bulkConfirmAction, ids: bulkIds }); }} title={bulkConfirmAction === "archive" ? "أرشفة المقالات المحددة" : "نقل المقالات المحددة إلى السلة"} description={`سيُطبّق هذا الإجراء على ${bulkIds.length.toLocaleString("ar-SA")} مقالات.`} confirmText="تأكيد الإجراء" variant={bulkConfirmAction === "archive" ? "warning" : "danger"} isSubmitting={bulk.isPending} />

      <Dialog.Root open={Boolean(permanentTarget)} onOpenChange={(open) => !open && setPermanentTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[90] bg-black/60" />
          <Dialog.Content dir="rtl" className="fixed left-1/2 top-1/2 z-[91] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <Dialog.Title className="text-xl font-bold text-danger">حذف المقال نهائيًا</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">اكتب عنوان المقال كما هو للتأكيد. لا يمكن التراجع عن الحذف.</Dialog.Description>
            <p className="mt-4 rounded-lg bg-muted p-3 text-sm font-bold">{permanentTarget?.title}</p>
            <label className="mt-4 block text-xs font-bold">عنوان المقال<input autoFocus value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background p-3 text-sm" /></label>
            {confirmation && permanentTarget && !matchesPermanentDeleteTitle(permanentTarget.title, confirmation) ? <p className="mt-2 text-xs text-danger">العنوان غير مطابق.</p> : null}
            <div className="mt-5 flex justify-end gap-2"><Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm font-bold">إلغاء</Dialog.Close><button type="button" disabled={!permanentTarget || !matchesPermanentDeleteTitle(permanentTarget.title, confirmation) || permanent.isPending} onClick={() => permanentTarget && permanent.mutate({ id: String(permanentTarget.id ?? permanentTarget._id), confirmation })} className="rounded-lg bg-danger px-4 py-2 text-sm font-bold text-white disabled:opacity-40">حذف نهائي</button></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
