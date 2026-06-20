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
import type { Service } from "@/lib/api/types";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { createServiceColumns, serviceColumnLabels } from "./columns";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";
import { ServiceForm } from "./form";
import { serviceFormSchema, ServiceFormValues } from "./schema";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function ServicesPageClient() {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useQueryStates(adminSearchParamsSchema);

  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form initialization
  const form = useForm<any>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      shortDescription: "",
      detailedDescription: "",
      icon: null,
      startingPrice: "",
      currency: "USD",
      price: "",
      duration: "",
      deliverables: [],
      requirements: [],
      ctaText: "",
      ctaUrl: "",
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

  // 1. Fetch Services list
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("services", queryParams),
    queryFn: () =>
      adminClient.listResource<Service>("services", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        isPublished:
          queryParams.isPublished === "published"
            ? true
            : queryParams.isPublished === "draft"
            ? false
            : undefined,
        sortBy: queryParams.sortBy || "createdAt",
        sortOrder: queryParams.sortOrder || "desc",
      }),
  });

  const invalidateKeys = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("services") });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
  };

  // 2. Mutations
  const saveMutation = useMutation({
    mutationFn: async (values: ServiceFormValues) => {
      // Map deliverables & requirements back to string[]
      const payload = {
        ...values,
        startingPrice: (typeof values.startingPrice === "number" && !isNaN(values.startingPrice)) ? values.startingPrice : (values.startingPrice && !isNaN(Number(values.startingPrice))) ? Number(values.startingPrice) : undefined,
        ctaUrl: values.ctaUrl || undefined,
        detailedDescription: values.detailedDescription || undefined,
        price: values.price || undefined,
        duration: values.duration || undefined,
        ctaText: values.ctaText || undefined,
        deliverables: (values.deliverables || []).map((x: any) => typeof x === "string" ? x : x.value).filter(Boolean),
        requirements: (values.requirements || []).map((x: any) => typeof x === "string" ? x : x.value).filter(Boolean),
        seo: values.seo
          ? {
              metaTitle: values.seo.metaTitle || undefined,
              metaDescription: values.seo.metaDescription || undefined,
              ogImage: values.seo.ogImage || undefined,
            }
          : undefined,
      };

      if (editingService) {
        const id = editingService.id ?? editingService._id ?? "";
        return adminClient.updateResource<Service>("services", id, payload);
      } else {
        return adminClient.createResource<Service>("services", payload);
      }
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "تم حفظ بيانات الخدمة بنجاح!");
      setIsDrawerOpen(false);
      invalidateKeys();
    },
    onError: (err) => {
      const isValidationMapped = setFormErrors(err, setError);
      if (!isValidationMapped) {
        handleAdminError(err, "فشل حفظ بيانات الخدمة. يرجى مراجعة المدخلات.");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminClient.deleteResource("services", id),
    onSuccess: () => {
      toast.success("تم حذف الخدمة نهائياً بنجاح");
      setDeletingId(null);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل حذف الخدمة المهملة"),
  });

  // Action (Publish, Unpublish)
  const patchActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "publish" | "unpublish" }) => {
      return adminClient.patchResource<Service>("services", `${id}/${action}`);
    },
    onSuccess: (_, variables) => {
      const msg = variables.action === "publish" ? "تم نشر الخدمة للعامة!" : "تم إلغاء النشر بنجاح!";
      toast.success(msg);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تعديل حالة الخدمة"),
  });

  // Reorder Mutation
  const reorderMutation = useMutation({
    mutationFn: async ({ items }: { items: Array<{ id: string; order: number }> }) => {
      return adminClient.reorderResource("services", items);
    },
    onSuccess: () => {
      toast.success("تم تحديث ترتيب الخدمات بنجاح!");
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تحديث الترتيب الجديد"),
  });

  const handleReorder = (service: Service, direction: "up" | "down") => {
    const items = data?.items || [];
    const id = service.id ?? service._id ?? "";
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
    setEditingService(null);
    reset({
      name: "",
      slug: "",
      shortDescription: "",
      detailedDescription: "",
      icon: null,
      startingPrice: "",
      currency: "USD",
      price: "",
      duration: "",
      deliverables: [],
      requirements: [],
      ctaText: "",
      ctaUrl: "",
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

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);

    // Map string[] deliverables / requirements to { value: string }[] for repeaters
    const deliverablesList = (service.deliverables || []).map((x) => ({ value: x }));
    const requirementsList = (service.requirements || []).map((x) => ({ value: x }));

    reset({
      name: service.name || "",
      slug: service.slug || "",
      shortDescription: service.shortDescription || "",
      detailedDescription: service.detailedDescription || "",
      icon: service.icon || null,
      startingPrice: service.startingPrice !== undefined && service.startingPrice !== null ? service.startingPrice : "",
      currency: service.currency || "USD",
      price: service.price || "",
      duration: service.duration || "",
      deliverables: deliverablesList as any,
      requirements: requirementsList as any,
      ctaText: service.ctaText || "",
      ctaUrl: service.ctaUrl || "",
      isFeatured: !!service.isFeatured,
      isPublished: service.isPublished !== false,
      seo: {
        metaTitle: service.seo?.metaTitle || "",
        metaDescription: service.seo?.metaDescription || "",
        ogImage: service.seo?.ogImage || "",
      },
    });
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = form.handleSubmit(
    (values: any) => {
      saveMutation.mutate(values);
    },
    (errors) => {
      console.error("Service Form validation errors:", errors);
      toast.error("يرجى مراجعة الحقول المطلوبة وتصحيح الأخطاء.");
    }
  );

  const columns = createServiceColumns({
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
        title="إدارة الخدمات"
        description="أنشئ وأدر باقات خدماتك الاحترافية، وتصفح أسعارها ومخرجاتها ورتبها بنقرات ذكية."
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
          <span>إضافة خدمة جديدة</span>
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
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder as "asc" | "desc"}
        onSortChange={(sortBy, sortOrder) => setQueryParams({ sortBy, sortOrder, page: 1 })}
        serverSortableColumns={["createdAt", "updatedAt", "order", "name", "category"]}
        filtersValue={{ isPublished: queryParams.isPublished }}
        onFilterChange={(key, val) => setQueryParams({ isPublished: val || undefined, page: 1 })}
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="ابحث عن خدمة بالاسم..."
        columnLabels={serviceColumnLabels}
        exportFilename="services_list"
        emptyTitle="لا توجد خدمات مضافة"
        emptyDescription="لم يتم العثور على أية خدمات متطابقة لخيارات الفرز الحالية. يمكنك البدء بإضافة باقتك الأولى الآن!"
        filterOptions={[
          {
            key: "isPublished",
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
        title={editingService ? "تعديل باقة الخدمة" : "إضافة خدمة جديدة"}
        description={editingService ? "تحديث حقول الخدمة والتسعير والـ SEO والمسلمات." : "املأ الحقول وصغ مسلمات العمل ومستندات البدء لإثراء الخدمة."}
        onSubmit={handleFormSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <ServiceForm form={form} onSubmit={handleFormSubmit} />
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
        title="حذف الخدمة نهائياً؟"
        description="هل أنت متأكد من رغبتك في حذف هذه الخدمة نهائياً من باقاتك ومحركات البحث؟ لا يمكن التراجع عن هذا الإجراء!"
        confirmText="نعم، حذف نهائي"
        cancelText="إلغاء التراجع"
        variant="danger"
        isSubmitting={deleteMutation.isPending}
      />
    </div>
  );
}
