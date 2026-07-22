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
import type { Education } from "@/lib/api/types";
import { toDateInputValue } from "@/lib/date-input";
import { createEducationColumns, educationColumnLabels } from "./columns";
import { EducationForm } from "./form";
import { buildEducationPayload, educationFormSchema, type EducationFormValues } from "./schema";
import { useAdminOptions } from "../../hooks/use-options";

const emptyValues: EducationFormValues = {
  institution: "", slug: "", degree: "", degreeType: "other", fieldOfStudy: "", startDate: "", endDate: "", isCurrent: false, grade: "", description: "", location: "", institutionUrl: "",
  institutionLogoMediaId: null, institutionLogo: null, coverImageMediaId: null, coverImage: null, certificateMediaId: null, certificate: null,
  achievements: [], isFeatured: false, isPublished: true, order: 0,
  seo: { metaTitle: "", metaDescription: "", ogImageMediaId: null, ogImage: null },
};

type ItemAction = "publish" | "unpublish" | "feature" | "unfeature";

export function EducationPageClient() {
  const queryClient = useQueryClient();
  const { data: options } = useAdminOptions();
  const [query, setQuery] = useQueryStates(adminSearchParamsSchema);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const form = useForm<EducationFormValues>({ resolver: zodResolver(educationFormSchema), defaultValues: emptyValues });

  const list = useQuery({
    queryKey: adminQueryKeys.resource("education", query),
    queryFn: () => adminClient.listResource<Education>("education", {
      page: query.page, limit: query.limit, search: query.search || undefined, sortBy: query.sortBy, sortOrder: query.sortOrder,
      degreeType: query.degreeType === "all" ? undefined : query.degreeType,
      institution: query.institution || undefined, startYear: query.startYear || undefined, endYear: query.endYear || undefined,
      isCurrent: query.isCurrent === "current" ? true : query.isCurrent === "completed" ? false : undefined,
      isPublished: query.isPublished === "published" ? true : query.isPublished === "draft" ? false : undefined,
      isFeatured: query.isFeatured === "featured" ? true : query.isFeatured === "regular" ? false : undefined,
    }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("education") });
    void queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
    void adminClient.revalidate({ tags: ["education"], paths: ["/", "/about", "/education", "/sitemap.xml"] });
  };

  const save = useMutation({
    mutationFn: (values: EducationFormValues) => {
      const payload = buildEducationPayload(values); const id = editing?.id ?? editing?._id;
      return id ? adminClient.updateResource<Education>("education", id, payload) : adminClient.createResource<Education>("education", payload);
    },
    onSuccess: (response) => { toast.success(response.message); setDrawerOpen(false); invalidate(); },
    onError: (error) => { if (!setFormErrors(error, form.setError)) handleAdminError(error, "تعذر حفظ المؤهل"); },
  });
  const remove = useMutation({
    mutationFn: (id: string) => adminClient.deleteResource("education", id),
    onSuccess: () => { toast.success("تم حذف المؤهل"); setDeletingId(null); if ((list.data?.items.length ?? 0) === 1 && query.page > 1) void setQuery({ page: query.page - 1 }); invalidate(); },
    onError: (error) => handleAdminError(error, "تعذر حذف المؤهل"),
  });
  const action = useMutation({
    mutationFn: ({ id, name }: { id: string; name: ItemAction }) => adminClient.patchResource<Education>("education", `${id}/${name}`),
    onSuccess: (response) => { toast.success(response.message); invalidate(); },
    onError: (error) => handleAdminError(error, "تعذر تحديث حالة المؤهل"),
  });
  const reorder = useMutation({
    mutationFn: (items: { id: string; order: number }[]) => adminClient.reorderResource("education", items),
    onSuccess: () => { toast.success("تم تحديث الترتيب"); invalidate(); },
    onError: (error) => handleAdminError(error, "تعذر تحديث الترتيب"),
  });
  const bulk = useMutation({
    mutationFn: ({ name, ids }: { name: string; ids: string[] }) => adminClient.bulkAction("education", name, ids),
    onSuccess: () => { toast.success("اكتمل الإجراء الجماعي"); setBulkDeleteIds([]); invalidate(); },
    onError: (error) => handleAdminError(error, "تعذر تنفيذ الإجراء الجماعي"),
  });

  const openCreate = () => { setEditing(null); form.reset(emptyValues); setDrawerOpen(true); };
  const openEdit = (item: Education) => {
    setEditing(item);
    form.reset({
      institution: item.institution, slug: item.slug, degree: item.degree, degreeType: item.degreeType, fieldOfStudy: item.fieldOfStudy ?? "", startDate: toDateInputValue(item.startDate), endDate: toDateInputValue(item.endDate), isCurrent: item.isCurrent,
      grade: item.grade ?? "", description: item.description ?? "", location: item.location ?? "", institutionUrl: item.institutionUrl ?? "",
      institutionLogoMediaId: item.institutionLogoMediaId ?? null, institutionLogo: item.institutionLogo ?? null, coverImageMediaId: item.coverImageMediaId ?? null, coverImage: item.coverImage ?? null, certificateMediaId: item.certificateMediaId ?? null, certificate: item.certificate ?? null,
      achievements: item.achievements ?? [], isFeatured: !!item.isFeatured, isPublished: item.isPublished !== false, order: item.order ?? 0,
      seo: { metaTitle: item.seo?.metaTitle ?? "", metaDescription: item.seo?.metaDescription ?? "", ogImageMediaId: item.seo?.ogImageMediaId ?? null, ogImage: item.seo?.ogImage ?? null },
    });
    setDrawerOpen(true);
  };
  const handleReorder = (item: Education, direction: "up" | "down") => {
    const items = list.data?.items ?? []; const index = items.findIndex((candidate) => (candidate.id ?? candidate._id) === (item.id ?? item._id)); const target = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= items.length) return;
    reorder.mutate([{ id: item.id ?? item._id ?? "", order: items[target].order ?? target }, { id: items[target].id ?? items[target]._id ?? "", order: item.order ?? index }]);
  };

  const columns = createEducationColumns({ onEdit: openEdit, onDelete: setDeletingId, onAction: (id, name) => action.mutate({ id, name }), onReorder: handleReorder });
  const institutionOptions = useMemo(() => [...new Set((list.data?.items ?? []).map((item) => item.institution))].map((value) => ({ label: value, value })), [list.data?.items]);
  const startYearOptions = useMemo(() => [...new Set((list.data?.items ?? []).map((item) => toDateInputValue(item.startDate).slice(0, 4)).filter(Boolean))].map((value) => ({ label: value, value })), [list.data?.items]);
  const endYearOptions = useMemo(() => [...new Set((list.data?.items ?? []).map((item) => toDateInputValue(item.endDate).slice(0, 4)).filter(Boolean))].map((value) => ({ label: value, value })), [list.data?.items]);

  return <div className="space-y-6" dir="rtl">
    <AdminPageHeader title="إدارة المؤهلات الأكاديمية" description="إدارة المؤسسات والدرجات والفترات والإنجازات والملفات.">
      <button type="button" onClick={() => void list.refetch()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-bold"><RefreshCw className={`h-4 w-4 ${list.isRefetching ? "animate-spin" : ""}`} />تحديث</button>
      <button type="button" onClick={openCreate} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground"><Plus className="h-4 w-4" />إضافة مؤهل</button>
    </AdminPageHeader>
    <DataTable serverSide columns={columns} data={list.data?.items ?? []} isLoading={list.isLoading} page={list.data?.meta.page ?? query.page} limit={list.data?.meta.limit ?? query.limit} total={list.data?.meta.total ?? 0} totalPages={list.data?.meta.totalPages ?? 1}
      searchValue={query.search} onSearchChange={(value) => void setQuery({ search: value || undefined, page: 1 })} onPageChange={(page) => void setQuery({ page })} onLimitChange={(limit) => void setQuery({ limit, page: 1 })}
      sortBy={query.sortBy} sortOrder={query.sortOrder as "asc" | "desc"} onSortChange={(sortBy, sortOrder) => void setQuery({ sortBy, sortOrder, page: 1 })} serverSortableColumns={["createdAt", "updatedAt", "order", "institution", "degree", "degreeType", "startDate", "endDate"]}
      filtersValue={{ isPublished: query.isPublished, isFeatured: query.isFeatured, degreeType: query.degreeType, isCurrent: query.isCurrent, institution: query.institution, startYear: query.startYear, endYear: query.endYear }}
      onFilterChange={(key, value) => { if (key === "isPublished") void setQuery({ isPublished: value || "all", page: 1 }); else if (key === "isFeatured") void setQuery({ isFeatured: value || "all", page: 1 }); else if (key === "degreeType") void setQuery({ degreeType: value || "all", page: 1 }); else if (key === "isCurrent") void setQuery({ isCurrent: value || "all", page: 1 }); else if (key === "institution") void setQuery({ institution: value || "", page: 1 }); else if (key === "startYear") void setQuery({ startYear: value || "", page: 1 }); else if (key === "endYear") void setQuery({ endYear: value || "", page: 1 }); }}
      filterOptions={[{ key: "isPublished", label: "النشر", options: [{ label: "منشور", value: "published" }, { label: "مسودة", value: "draft" }] }, { key: "isFeatured", label: "الإبراز", options: [{ label: "مميز", value: "featured" }, { label: "عادي", value: "regular" }] }, { key: "degreeType", label: "نوع الدرجة", options: (options?.educationDegreeTypes ?? []).map((item) => ({ label: item.labelAr || item.labelEn, value: item.value })) }, { key: "isCurrent", label: "الحالة", options: [{ label: "حاليًا", value: "current" }, { label: "مكتمل", value: "completed" }] }, { key: "institution", label: "المؤسسة", options: institutionOptions }, { key: "startYear", label: "سنة البداية", options: startYearOptions }, { key: "endYear", label: "سنة النهاية", options: endYearOptions }]}
      bulkActions={[{ action: "publish", label: "نشر المحدد" }, { action: "unpublish", label: "إلغاء نشر المحدد" }, { action: "feature", label: "إبراز المحدد" }, { action: "unfeature", label: "إلغاء إبراز المحدد" }, { action: "delete", label: "حذف المحدد", variant: "danger" }]}
      onBulkAction={(name, ids) => { if (name === "delete") setBulkDeleteIds(ids); else bulk.mutate({ name, ids }); }} searchKey="degree" searchPlaceholder="ابحث بالدرجة أو المؤسسة أو التخصص..." columnLabels={educationColumnLabels} exportFilename="education" emptyTitle="لا توجد مؤهلات" emptyDescription={query.search ? "لا توجد نتائج مطابقة لبحثك." : "ابدأ بإضافة أول مؤهل أكاديمي."} />
    <ResourceFormDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={editing ? "تعديل المؤهل" : "إضافة مؤهل"} description="احفظ التواريخ والوسائط وحالة النشر لكل مؤهل." onSubmit={form.handleSubmit((values) => save.mutate(values))} isSubmitting={save.isPending} size="xl"><EducationForm form={form} /></ResourceFormDrawer>
    <ConfirmDialog isOpen={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={() => { if (deletingId) remove.mutate(deletingId); }} title="حذف المؤهل؟" description="سيتم حذف السجل وتحرير ارتباطات الوسائط." confirmText="حذف" variant="danger" isSubmitting={remove.isPending} />
    <ConfirmDialog isOpen={bulkDeleteIds.length > 0} onClose={() => setBulkDeleteIds([])} onConfirm={() => bulk.mutate({ name: "delete", ids: bulkDeleteIds })} title={`حذف ${bulkDeleteIds.length} مؤهل؟`} description="لا يمكن التراجع عن الحذف الجماعي." confirmText="حذف المحدد" variant="danger" isSubmitting={bulk.isPending} />
  </div>;
}
