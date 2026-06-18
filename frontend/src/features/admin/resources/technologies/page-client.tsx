"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryStates } from "nuqs";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { adminClient, clientApiRequest } from "@/lib/api/admin-client";
import { adminQueryKeys } from "@/lib/api/admin-query-keys";
import { handleAdminError, setFormErrors } from "@/lib/api/admin-errors";
import { adminSearchParamsSchema } from "@/lib/api/admin-search-params";
import type { Technology } from "@/lib/api/types";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { createTechnologyColumns, technologyColumnLabels } from "./columns";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";
import { TechnologyForm } from "./form";
import { technologyFormSchema, TechnologyFormValues } from "./schema";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function TechnologiesPageClient() {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useQueryStates(adminSearchParamsSchema);

  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<Technology | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form initialization
  const form = useForm<TechnologyFormValues>({
    resolver: zodResolver(technologyFormSchema) as any,
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      icon: null,
      category: "frontend",
      group: "",
      proficiencyLevel: "intermediate",
      officialUrl: "",
      yearsOfExperience: "",
      color: "#4f46e5",
      highlighted: false,
      isPublished: true,
    } as any,
  });

  const { reset, setError } = form;

  // 1. Fetch list
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("technologies", queryParams),
    queryFn: () =>
      adminClient.listResource<Technology>("technologies", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        isPublished: queryParams.status === "published" ? true : queryParams.status === "draft" ? false : undefined,
      }),
  });

  const invalidateKeys = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("technologies") });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
  };

  // 2. Save Mutation (Create/Update)
  const saveMutation = useMutation({
    mutationFn: async (values: TechnologyFormValues) => {
      const payload = {
        ...values,
        yearsOfExperience: values.yearsOfExperience !== "" && values.yearsOfExperience !== null && values.yearsOfExperience !== undefined ? Number(values.yearsOfExperience) : undefined,
        officialUrl: values.officialUrl || undefined,
        description: values.description || undefined,
        group: values.group || undefined,
      };

      if (editingTech) {
        const id = editingTech.id ?? editingTech._id ?? "";
        return adminClient.updateResource<Technology>("technologies", id, payload);
      } else {
        return adminClient.createResource<Technology>("technologies", payload);
      }
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "تم حفظ بيانات التقنية بنجاح!");
      setIsDrawerOpen(false);
      invalidateKeys();
    },
    onError: (err) => {
      const isValidationMapped = setFormErrors(err, setError);
      if (!isValidationMapped) {
        handleAdminError(err, "فشل حفظ بيانات التقنية. يرجى مراجعة الحقول.");
      }
    },
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminClient.deleteResource("technologies", id),
    onSuccess: () => {
      toast.success("تم حذف التقنية نهائياً بنجاح");
      setDeletingId(null);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل حذف التقنية المحددة"),
  });

  // 4. Publish / Unpublish Action Mutation
  const patchActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "publish" | "unpublish" }) => {
      return adminClient.patchResource<Technology>("technologies", `${id}/${action}`);
    },
    onSuccess: (_, variables) => {
      const msg = variables.action === "publish" ? "تم تنشيط وعرض التقنية!" : "تم إخاء وتجميد التقنية!";
      toast.success(msg);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تعديل حالة التقنية"),
  });

  // 5. Reorder Mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ items }: { items: Array<{ id: string; order: number }> }) => {
      return adminClient.reorderResource("technologies", items);
    },
    onSuccess: () => {
      toast.success("تم تحديث ترتيب التقنيات بنجاح!");
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تحديث ترتيب التقنيات"),
  });

  const handleReorder = (tech: Technology, direction: "up" | "down") => {
    const items = data?.items || [];
    const id = tech.id ?? tech._id ?? "";
    const currentIndex = items.findIndex((x) => (x.id ?? x._id) === id);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === items.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    const reorderItems = items.map((x, idx) => {
      let newOrder = idx;
      if (idx === currentIndex) newOrder = targetIndex;
      else if (idx === targetIndex) newOrder = currentIndex;
      return {
        id: x.id ?? x._id ?? "",
        order: newOrder,
      };
    });

    reorderMutation.mutate({ items: reorderItems });
  };

  // Handlers
  const handleOpenCreate = () => {
    setEditingTech(null);
    reset({
      name: "",
      slug: "",
      description: "",
      icon: null,
      category: "frontend",
      group: "",
      proficiencyLevel: "intermediate",
      officialUrl: "",
      yearsOfExperience: "",
      color: "#4f46e5",
      highlighted: false,
      isPublished: true,
    } as any);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (tech: Technology) => {
    setEditingTech(tech);
    reset({
      name: tech.name || "",
      slug: tech.slug || "",
      description: tech.description || "",
      icon: tech.icon || null,
      category: tech.category || "frontend",
      group: tech.group || "",
      proficiencyLevel: tech.proficiencyLevel || "intermediate",
      officialUrl: tech.officialUrl || "",
      yearsOfExperience: tech.yearsOfExperience !== undefined && tech.yearsOfExperience !== null ? tech.yearsOfExperience : "",
      color: tech.color || "#4f46e5",
      highlighted: !!tech.highlighted,
      isPublished: tech.isPublished !== false,
    } as any);
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = form.handleSubmit((values: any) => {
    saveMutation.mutate(values);
  });

  const columns = createTechnologyColumns({
    onEdit: handleOpenEdit,
    onDelete: setDeletingId,
    onPublish: (id) => patchActionMutation.mutate({ id, action: "publish" }),
    onUnpublish: (id) => patchActionMutation.mutate({ id, action: "unpublish" }),
    onReorder: handleReorder,
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <AdminPageHeader
        title="إدارة التقنيات والخبرات"
        description="صنف وعزز مهاراتك التقنية، مستويات خبرتك العملية، وقم بتثبيت التقنيات الأكثر تميزاً في واجهة موقعك."
      >
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none disabled:opacity-50"
          title="تحديث البيانات"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          <span>تحديث</span>
        </button>
        <button
          onClick={handleOpenCreate}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer transition select-none shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>إضافة تقنية جديدة</span>
        </button>
      </AdminPageHeader>

      {/* Main DataTable list */}
      <DataTable
        serverSide
        page={data?.meta?.page ?? queryParams.page}
        limit={data?.meta?.limit ?? queryParams.limit}
        total={data?.meta?.total ?? 0}
        totalPages={data?.meta?.totalPages ?? 1}
        searchValue={queryParams.search}
        onSearchChange={(val) => setQueryParams({ search: val || undefined, page: 1 })}
        onPageChange={(p) => setQueryParams({ page: p })}
        onLimitChange={(l) => setQueryParams({ limit: l, page: 1 })}
        filtersValue={{ isPublished: queryParams.status }}
        onFilterChange={(key, val) => setQueryParams({ status: val || undefined, page: 1 })}
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="ابحث عن تقنية بالاسم..."
        columnLabels={technologyColumnLabels}
        exportFilename="technologies_list"
        emptyTitle="لا توجد تقنيات مضافة"
        emptyDescription="لم يتم العثور على أية تقنيات متطابقة لخيارات الفرز الحالية. ابدأ الآن بإضافة مهارتك أو إطار عملك المفضل!"
        filterOptions={[
          {
            key: "isPublished",
            label: "الحالات",
            options: [
              { label: "المسودات", value: "draft" },
              { label: "النشطة", value: "published" },
            ],
          },
        ]}
      />

      {/* 1. Form Slide-over Drawer */}
      <ResourceFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingTech ? "تعديل بيانات التقنية" : "إضافة تقنية جديدة"}
        description={editingTech ? "تحديث بيانات التقنية واللون ودرجة الخبرة العملية." : "أدخل الحقول وعيّن اللون والمستوى والشعار لتسليط الضوء على مهارتك."}
        onSubmit={handleFormSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <TechnologyForm form={form} onSubmit={handleFormSubmit} />
      </ResourceFormDrawer>

      {/* 2. Safe Delete confirmation alert */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            deleteMutation.mutate(deletingId);
          }
        }}
        title="حذف التقنية نهائياً؟"
        description="هل أنت متأكد من رغبتك في حذف هذه التقنية نهائياً من قائمة مهاراتك؟ سيختفي شعارها ومعلوماتها من كافة المشاريع والصفحات المرتبطة!"
        confirmText="نعم، حذف نهائي"
        cancelText="إلغاء التراجع"
        variant="danger"
        isSubmitting={deleteMutation.isPending}
      />
    </div>
  );
}
