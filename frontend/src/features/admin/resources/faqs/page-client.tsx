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
import type { Faq } from "@/lib/api/types";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { createFaqColumns, faqColumnLabels } from "./columns";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";
import { FaqForm } from "./form";
import { faqFormSchema, FaqFormValues } from "./schema";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function FaqsPageClient() {
  const queryClient = useQueryClient();
  const [queryParams] = useQueryStates(adminSearchParamsSchema);

  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form initialization
  const form = useForm<FaqFormValues>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "general",
      isFeatured: false,
      isPublished: true,
      seo: {
        metaTitle: "",
        metaDescription: "",
        ogImage: "",
      },
    },
  });

  const { reset, setError } = form;

  // 1. Fetch list
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("faqs", queryParams),
    queryFn: () =>
      adminClient.listResource<Faq>("faqs", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        status: queryParams.status === "all" ? undefined : queryParams.status,
      }),
  });

  const invalidateKeys = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("faqs") });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
  };

  // 2. Save Mutation (Create/Update)
  const saveMutation = useMutation({
    mutationFn: async (values: FaqFormValues) => {
      if (editingFaq) {
        const id = editingFaq.id ?? editingFaq._id ?? "";
        return adminClient.updateResource<Faq>("faqs", id, values);
      } else {
        return adminClient.createResource<Faq>("faqs", values);
      }
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "تم حفظ السؤال بنجاح!");
      setIsDrawerOpen(false);
      invalidateKeys();
    },
    onError: (err) => {
      const isValidationMapped = setFormErrors(err, setError);
      if (!isValidationMapped) {
        handleAdminError(err, "فشل حفظ بيانات السؤال الشائع.");
      }
    },
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminClient.deleteResource("faqs", id),
    onSuccess: () => {
      toast.success("تم حذف السؤال بنجاح");
      setDeletingId(null);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل حذف السؤال المحدد"),
  });

  // 4. Publish / Unpublish Action Mutation
  const patchActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "publish" | "unpublish" }) => {
      return adminClient.updateResource<Faq>(`faqs`, `${id}/${action}`, {});
    },
    onSuccess: (_, variables) => {
      const msg = variables.action === "publish" ? "تم تفعيل ونشر السؤال!" : "تم إلغاء نشر السؤال بنجاح!";
      toast.success(msg);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تعديل حالة السؤال"),
  });

  // 5. Reorder Mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ items }: { items: Array<{ id: string; order: number }> }) => {
      return clientApiRequest(`faqs/reorder`, {
        method: "PATCH",
        body: { items },
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث ترتيب الأسئلة بنجاح!");
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تحديث الترتيب الجديد"),
  });

  const handleReorder = (faq: Faq, direction: "up" | "down") => {
    const items = data?.items || [];
    const id = faq.id ?? faq._id ?? "";
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
    setEditingFaq(null);
    reset({
      question: "",
      answer: "",
      category: "general",
      isFeatured: false,
      isPublished: true,
      seo: {
        metaTitle: "",
        metaDescription: "",
        ogImage: "",
      },
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (faq: Faq) => {
    setEditingFaq(faq);
    reset({
      question: faq.question || "",
      answer: faq.answer || "",
      category: faq.category || "general",
      isFeatured: !!faq.isFeatured,
      isPublished: faq.isPublished !== false,
      seo: {
        metaTitle: faq.seo?.metaTitle || "",
        metaDescription: faq.seo?.metaDescription || "",
        ogImage: (faq.seo as any)?.ogImage || "",
      },
    });
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = form.handleSubmit((values: any) => {
    saveMutation.mutate(values);
  });

  const columns = createFaqColumns({
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
        title="إدارة الأسئلة الشائعة"
        description="أنشئ الأسئلة المتكررة وأجب عليها لتثبيتها في الموقع وتسهيل وصول عملائك للمعلومات الضرورية."
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
          <span>إضافة سؤال جديد</span>
        </button>
      </AdminPageHeader>

      {/* Main DataTable list */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchKey="question"
        searchPlaceholder="ابحث عن سؤال بالاسم..."
        columnLabels={faqColumnLabels}
        exportFilename="faqs_list"
        emptyTitle="لا توجد أسئلة مضافة"
        emptyDescription="لم يتم العثور على أية أسئلة متوافقة لخيارات التصفية الحالية. ابدأ وصغ سؤالك الأول الآن!"
        filterOptions={[
          {
            key: "status",
            label: "الحالات",
            options: [
              { label: "المسودات", value: "draft" },
              { label: "المنشورة", value: "published" },
            ],
          },
        ]}
      />

      {/* 1. Form Slide-over Drawer */}
      <ResourceFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingFaq ? "تعديل السؤال الشائع" : "إضافة سؤال جديد"}
        description={editingFaq ? "تحديث حقول الأسئلة الشائعة والأجوبة والـ SEO." : "املأ الحقول وصغ الإجابة الموجهة للعملاء لزيادة الثقة والسرعة."}
        onSubmit={handleFormSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <FaqForm form={form} onSubmit={handleFormSubmit} />
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
        title="حذف السؤال نهائياً؟"
        description="هل أنت متأكد من رغبتك في حذف هذا السؤال نهائياً من الموقع ومحركات البحث؟ لا يمكن استعادة هذا الإجراء!"
        confirmText="نعم، حذف نهائي"
        cancelText="إلغاء التراجع"
        variant="danger"
        isSubmitting={deleteMutation.isPending}
      />
    </div>
  );
}
