"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryStates } from "nuqs";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";
import { adminClient } from "@/lib/api/admin-client";
import { handleAdminError, setFormErrors } from "@/lib/api/admin-errors";
import { adminQueryKeys } from "@/lib/api/admin-query-keys";
import { adminSearchParamsSchema } from "@/lib/api/admin-search-params";
import type { Certification } from "@/lib/api/types";
import { toDateInputValue } from "@/lib/date-input";
import { createCertificationColumns, certificationColumnLabels } from "./columns";
import { CertificationForm } from "./form";
import { buildCertificationPayload, certificationFormSchema, type CertificationFormValues } from "./schema";
import { useAdminOptions } from "../../hooks/use-options";

const emptyValues: CertificationFormValues = {
  title: "", slug: "", type: "course", issuer: "", platform: "", platformUrl: "", description: "", credentialId: "", credentialUrl: "", issuedAt: "", expiresAt: "", doesNotExpire: true,
  imageMediaId: null, image: null, documentMediaId: null, document: null, issuerLogoMediaId: null, issuerLogo: null,
  skills: [], category: "", language: "", durationHours: "", isFeatured: false, isPublished: true, order: 0,
  seo: { metaTitle: "", metaDescription: "", ogImageMediaId: null, ogImage: null },
};

type ItemAction = "publish" | "unpublish" | "feature" | "unfeature";

export function CertificationsPageClient() {
  const queryClient = useQueryClient();
  const { data: options } = useAdminOptions();
  const [query, setQuery] = useQueryStates(adminSearchParamsSchema);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Certification | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const form = useForm<CertificationFormValues>({ resolver: zodResolver(certificationFormSchema), defaultValues: emptyValues });

  const list = useQuery({
    queryKey: adminQueryKeys.resource("certifications", query),
    queryFn: () => adminClient.listResource<Certification>("certifications", {
      page: query.page, limit: query.limit, search: query.search || undefined,
      sortBy: query.sortBy, sortOrder: query.sortOrder,
      type: query.type === "all" ? undefined : query.type,
      platform: query.platform || undefined, issuer: query.issuer || undefined,
      year: query.year || undefined,
      isPublished: query.isPublished === "published" ? true : query.isPublished === "draft" ? false : undefined,
      isFeatured: query.isFeatured === "featured" ? true : query.isFeatured === "regular" ? false : undefined,
    }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("certifications") });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
    void adminClient.revalidate({ tags: ["certifications"], paths: ["/", "/about", "/certifications", "/sitemap.xml"] });
  };

  const save = useMutation({
    mutationFn: (values: CertificationFormValues) => {
      const payload = buildCertificationPayload(values);
      const id = editing?.id ?? editing?._id;
      return id ? adminClient.updateResource<Certification>("certifications", id, payload) : adminClient.createResource<Certification>("certifications", payload);
    },
    onSuccess: (response) => { toast.success(response.message); setDrawerOpen(false); invalidate(); },
    onError: (error) => { if (!setFormErrors(error, form.setError)) handleAdminError(error, "تعذر حفظ الشهادة"); },
  });

  const remove = useMutation({
    mutationFn: (id: string) => adminClient.deleteResource("certifications", id),
    onSuccess: () => {
      toast.success("تم حذف الشهادة"); setDeletingId(null);
      if ((list.data?.items.length ?? 0) === 1 && query.page > 1) void setQuery({ page: query.page - 1 });
      invalidate();
    },
    onError: (error) => handleAdminError(error, "تعذر حذف الشهادة"),
  });

  const action = useMutation({
    mutationFn: ({ id, name }: { id: string; name: ItemAction }) => adminClient.patchResource<Certification>("certifications", `${id}/${name}`),
    onSuccess: (response) => { toast.success(response.message); invalidate(); },
    onError: (error) => handleAdminError(error, "تعذر تحديث حالة الشهادة"),
  });

  const reorder = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => adminClient.reorderResource("certifications", items),
    onSuccess: () => { toast.success("تم تحديث الترتيب"); invalidate(); },
    onError: (error) => handleAdminError(error, "تعذر تحديث الترتيب"),
  });

  const bulk = useMutation({
    mutationFn: ({ name, ids }: { name: string; ids: string[] }) => adminClient.bulkAction("certifications", name, ids),
    onSuccess: () => { toast.success("اكتمل الإجراء الجماعي"); setBulkDeleteIds([]); invalidate(); },
    onError: (error) => handleAdminError(error, "تعذر تنفيذ الإجراء الجماعي"),
  });

  const openCreate = () => { setEditing(null); form.reset(emptyValues); setDrawerOpen(true); };
  const openEdit = (item: Certification) => {
    setEditing(item);
    form.reset({
      title: item.title, slug: item.slug, type: item.type, issuer: item.issuer, platform: item.platform ?? "", platformUrl: item.platformUrl ?? "", description: item.description ?? "", credentialId: item.credentialId ?? "", credentialUrl: item.credentialUrl ?? "",
      issuedAt: toDateInputValue(item.issuedAt), expiresAt: toDateInputValue(item.expiresAt), doesNotExpire: item.doesNotExpire,
      imageMediaId: item.imageMediaId ?? null, image: item.image ?? null, documentMediaId: item.documentMediaId ?? null, document: item.document ?? null, issuerLogoMediaId: item.issuerLogoMediaId ?? null, issuerLogo: item.issuerLogo ?? null,
      skills: item.skills ?? [], category: item.category ?? "", language: item.language ?? "", durationHours: item.durationHours ?? "", isFeatured: !!item.isFeatured, isPublished: item.isPublished !== false, order: item.order ?? 0,
      seo: { metaTitle: item.seo?.metaTitle ?? "", metaDescription: item.seo?.metaDescription ?? "", ogImageMediaId: item.seo?.ogImageMediaId ?? null, ogImage: item.seo?.ogImage ?? null },
    });
    setDrawerOpen(true);
  };

  const handleReorder = (item: Certification, direction: "up" | "down") => {
    const items = list.data?.items ?? []; const index = items.findIndex((candidate) => (candidate.id ?? candidate._id) === (item.id ?? item._id));
    const target = direction === "up" ? index - 1 : index + 1; if (index < 0 || target < 0 || target >= items.length) return;
    reorder.mutate([
      { id: item.id ?? item._id ?? "", order: items[target].order ?? target },
      { id: items[target].id ?? items[target]._id ?? "", order: item.order ?? index },
    ]);
  };

  const columns = createCertificationColumns({ onEdit: openEdit, onDelete: setDeletingId, onAction: (id, name) => action.mutate({ id, name }), onReorder: handleReorder });
  const platformOptions = (options?.certificationPlatformSuggestions ?? []).map((value) => ({ label: value, value }));
  const issuerOptions = useMemo(() => [...new Set((list.data?.items ?? []).map((item) => item.issuer))].map((value) => ({ label: value, value })), [list.data?.items]);
  const yearOptions = useMemo(() => [...new Set((list.data?.items ?? []).map((item) => toDateInputValue(item.issuedAt).slice(0, 4)).filter(Boolean))].map((value) => ({ label: value, value })), [list.data?.items]);

  return <div className="space-y-6" dir="rtl">
    <AdminPageHeader title="إدارة الشهادات المهنية" description="إدارة الدورات والاعتمادات والرخص ووسائطها وحالة نشرها.">
      <button type="button" onClick={() => void list.refetch()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold"><RefreshCw className={cnSpin(list.isRefetching)} />تحديث</button>
      <button type="button" onClick={openCreate} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground"><Plus className="h-4 w-4" />إضافة شهادة</button>
    </AdminPageHeader>
    <DataTable serverSide columns={columns} data={list.data?.items ?? []} isLoading={list.isLoading} page={list.data?.meta.page ?? query.page} limit={list.data?.meta.limit ?? query.limit} total={list.data?.meta.total ?? 0} totalPages={list.data?.meta.totalPages ?? 1}
      searchValue={query.search} onSearchChange={(value) => void setQuery({ search: value || undefined, page: 1 })} onPageChange={(page) => void setQuery({ page })} onLimitChange={(limit) => void setQuery({ limit, page: 1 })}
      sortBy={query.sortBy} sortOrder={query.sortOrder as "asc" | "desc"} onSortChange={(sortBy, sortOrder) => void setQuery({ sortBy, sortOrder, page: 1 })} serverSortableColumns={["createdAt", "updatedAt", "order", "title", "issuer", "platform", "issuedAt", "type"]}
      filtersValue={{ isPublished: query.isPublished, isFeatured: query.isFeatured, type: query.type, platform: query.platform, issuer: query.issuer, year: query.year }}
      onFilterChange={(key, value) => { if (key === "isPublished") void setQuery({ isPublished: value || "all", page: 1 }); else if (key === "isFeatured") void setQuery({ isFeatured: value || "all", page: 1 }); else if (key === "type") void setQuery({ type: value || "all", page: 1 }); else if (key === "platform") void setQuery({ platform: value || "", page: 1 }); else if (key === "issuer") void setQuery({ issuer: value || "", page: 1 }); else if (key === "year") void setQuery({ year: value || "", page: 1 }); }}
      filterOptions={[{ key: "isPublished", label: "النشر", options: [{ label: "منشورة", value: "published" }, { label: "مسودة", value: "draft" }] }, { key: "isFeatured", label: "الإبراز", options: [{ label: "مميزة", value: "featured" }, { label: "عادية", value: "regular" }] }, { key: "type", label: "النوع", options: (options?.certificationTypes ?? []).map((item) => ({ label: item.labelAr || item.labelEn, value: item.value })) }, { key: "platform", label: "المنصة", options: platformOptions }, { key: "issuer", label: "الجهة", options: issuerOptions }, { key: "year", label: "السنة", options: yearOptions }]}
      bulkActions={[{ action: "publish", label: "نشر المحدد" }, { action: "unpublish", label: "إلغاء نشر المحدد" }, { action: "feature", label: "إبراز المحدد" }, { action: "unfeature", label: "إلغاء إبراز المحدد" }, { action: "delete", label: "حذف المحدد", variant: "danger" }]}
      onBulkAction={(name, ids) => { if (name === "delete") setBulkDeleteIds(ids); else bulk.mutate({ name, ids }); }} searchKey="title" searchPlaceholder="ابحث بالعنوان أو الجهة أو المنصة..." columnLabels={certificationColumnLabels} exportFilename="certifications" emptyTitle="لا توجد شهادات" emptyDescription={query.search ? "لا توجد نتائج مطابقة لبحثك." : "ابدأ بإضافة أول شهادة مهنية."} />
    <ResourceFormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "تعديل الشهادة" : "إضافة شهادة"} description="جميع الروابط والملفات تحفظ عبر مكتبة الوسائط." onSubmit={form.handleSubmit((values) => save.mutate(values))} isSubmitting={save.isPending} size="xl"><CertificationForm form={form} /></ResourceFormDrawer>
    <ConfirmDialog isOpen={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={() => { if (deletingId) remove.mutate(deletingId); }} title="حذف الشهادة؟" description="سيتم حذف السجل وتحرير ارتباطات الوسائط." confirmText="حذف" variant="danger" isSubmitting={remove.isPending} />
    <ConfirmDialog isOpen={bulkDeleteIds.length > 0} onClose={() => setBulkDeleteIds([])} onConfirm={() => bulk.mutate({ name: "delete", ids: bulkDeleteIds })} title={`حذف ${bulkDeleteIds.length} شهادة؟`} description="لا يمكن التراجع عن الحذف الجماعي." confirmText="حذف المحدد" variant="danger" isSubmitting={bulk.isPending} />
  </div>;
}

function cnSpin(active: boolean) { return `h-4 w-4 ${active ? "animate-spin" : ""}`; }
