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
import type { LinkItem } from "@/lib/api/types";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { createLinkColumns, linkColumnLabels } from "./columns";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";
import { LinkForm } from "./form";
import { linkFormSchema, LinkFormValues } from "./schema";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function LinksPageClient() {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useQueryStates(adminSearchParamsSchema);

  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form initialization
  const form = useForm<LinkFormValues>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      url: "https://",
      description: "",
      icon: null,
      platform: "",
      category: "social",
      openInNewTab: true,
      isFeatured: false,
      isPublished: true,
    },
  });

  const { reset, setError } = form;

  // 1. Fetch list
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("links", queryParams),
    queryFn: () =>
      adminClient.listResource<LinkItem>("links", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        isPublished: queryParams.status === "published" ? true : queryParams.status === "draft" ? false : undefined,
      }),
  });

  const invalidateKeys = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("links") });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
  };

  // 2. Save Mutation (Create/Update)
  const saveMutation = useMutation({
    mutationFn: async (values: LinkFormValues) => {
      const payload = {
        ...values,
        icon: values.icon || undefined,
        platform: values.platform || undefined,
        description: values.description || undefined,
      };

      if (editingLink) {
        const id = editingLink.id ?? editingLink._id ?? "";
        return adminClient.updateResource<LinkItem>("links", id, payload);
      } else {
        return adminClient.createResource<LinkItem>("links", payload);
      }
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "تم حفظ بيانات الرابط بنجاح!");
      setIsDrawerOpen(false);
      invalidateKeys();
    },
    onError: (err) => {
      const isValidationMapped = setFormErrors(err, setError);
      if (!isValidationMapped) {
        handleAdminError(err, "فشل حفظ بيانات الرابط. يرجى مراجعة الحقول المدخلة.");
      }
    },
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminClient.deleteResource("links", id),
    onSuccess: () => {
      toast.success("تم حذف الرابط بنجاح");
      setDeletingId(null);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل حذف الرابط المحدد"),
  });

  // 4. Publish / Unpublish Action Mutation
  const patchActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "publish" | "unpublish" }) => {
      return adminClient.patchResource<LinkItem>("links", `${id}/${action}`);
    },
    onSuccess: (_, variables) => {
      const msg = variables.action === "publish" ? "تم تفعيل ونشر الرابط بنجاح!" : "تم تعطيل الرابط بنجاح!";
      toast.success(msg);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تعديل حالة الرابط"),
  });

  // 5. Reorder Mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ items }: { items: Array<{ id: string; order: number }> }) => {
      return adminClient.reorderResource("links", items);
    },
    onSuccess: () => {
      toast.success("تم تحديث ترتيب الروابط بنجاح!");
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تحديث الترتيب"),
  });

  const handleReorder = (link: LinkItem, direction: "up" | "down") => {
    const items = data?.items || [];
    const id = link.id ?? link._id ?? "";
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
    setEditingLink(null);
    reset({
      title: "",
      slug: "",
      url: "https://",
      description: "",
      icon: null,
      platform: "",
      category: "social",
      openInNewTab: true,
      isFeatured: false,
      isPublished: true,
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (link: LinkItem) => {
    setEditingLink(link);
    reset({
      title: link.title || "",
      slug: link.slug || "",
      url: link.url || "https://",
      description: link.description || "",
      icon: link.icon || null,
      platform: link.platform || "",
      category: link.category || "social",
      openInNewTab: link.openInNewTab !== false,
      isFeatured: !!link.isFeatured,
      isPublished: link.isPublished !== false,
    });
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = form.handleSubmit((values: any) => {
    saveMutation.mutate(values);
  });

  const columns = createLinkColumns({
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
        title="إدارة الروابط العامة"
        description="نظم حساباتك الاجتماعية، روابط مراجعك، روابط بورتفوليو، وتابع إحصائيات نقرات الزوار عليها."
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
          <span>إضافة رابط جديد</span>
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
        searchKey="title"
        searchPlaceholder="ابحث عن رابط بالعنوان..."
        columnLabels={linkColumnLabels}
        exportFilename="links_list"
        emptyTitle="لا توجد روابط مضافة"
        emptyDescription="لم يتم العثور على أية روابط متطابقة لخيارات التصفية الحالية. أضف أول رابط خارجي الآن!"
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
        title={editingLink ? "تعديل بيانات الرابط" : "إضافة رابط جديد"}
        description={editingLink ? "تحديث العنوان، التصنيف والوجهة وصلاحية الفتح." : "أدخل بيانات المنصة، الرابط والأيقونة لنشرها للجمهور."}
        onSubmit={handleFormSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <LinkForm form={form} onSubmit={handleFormSubmit} />
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
        title="حذف الرابط نهائياً؟"
        description="هل أنت متأكد من رغبتك في حذف هذا الرابط نهائياً؟ ستزول إحصائيات النقرات والظهور من واجهة الزائر كلياً!"
        confirmText="نعم، حذف نهائي"
        cancelText="إلغاء التراجع"
        variant="danger"
        isSubmitting={deleteMutation.isPending}
      />
    </div>
  );
}
