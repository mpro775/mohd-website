"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryStates } from "nuqs";
import { Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { adminClient } from "@/lib/api/admin-client";
import { adminQueryKeys } from "@/lib/api/admin-query-keys";
import { handleAdminError, setFormErrors } from "@/lib/api/admin-errors";
import { adminSearchParamsSchema } from "@/lib/api/admin-search-params";
import type { Category } from "@/lib/api/types";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { createCategoryColumns, categoryColumnLabels } from "./columns";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";
import { CategoryForm } from "./form";
import { categoryFormSchema, CategoryFormValues } from "./schema";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function CategoriesPageClient() {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useQueryStates(adminSearchParamsSchema);

  // States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form initialization
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      isActive: true,
    },
  });

  const { reset, setError } = form;

  // 1. Fetch list
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("blog/categories", queryParams),
    queryFn: () =>
      adminClient.listResource<Category>("blog/categories", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        isActive:
          queryParams.isActive === "active"
            ? true
            : queryParams.isActive === "inactive"
            ? false
            : undefined,
        sortBy: queryParams.sortBy || "createdAt",
        sortOrder: queryParams.sortOrder || "desc",
      }),
  });

  const invalidateKeys = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("blog/categories") });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("posts") });
    adminClient.revalidate(["blog"]);
  };

  // 2. Save Mutation (Create/Update)
  const saveMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const payload = {
        name: values.name,
        slug: values.slug || undefined,
        description: values.description || undefined,
        isActive: !!values.isActive,
      };

      if (editingCategory) {
        const id = editingCategory.id ?? editingCategory._id ?? "";
        return adminClient.updateResource<Category>("blog/categories", id, payload);
      } else {
        return adminClient.createResource<Category>("blog/categories", payload);
      }
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "تم حفظ بيانات التصنيف بنجاح!");
      setIsDrawerOpen(false);
      invalidateKeys();
    },
    onError: (err) => {
      const isValidationMapped = setFormErrors(err, setError);
      if (!isValidationMapped) {
        handleAdminError(err, "فشل حفظ بيانات التصنيف. يرجى مراجعة الحقول.");
      }
    },
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminClient.deleteResource("blog/categories", id),
    onSuccess: () => {
      toast.success("تم حذف التصنيف بنجاح");
      setDeletingId(null);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل حذف التصنيف المحدد. قد يكون مربوطاً بمقالات منشورة!"),
  });

  // 4. Activate / Deactivate Action Mutation
  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "activate" | "deactivate" }) => {
      return adminClient.patchResource<Category>(`blog/categories`, `${id}/${action}`);
    },
    onSuccess: (_, variables) => {
      const msg = variables.action === "activate" ? "تم تفعيل وتنشيط التصنيف!" : "تم تعطيل وتجميد التصنيف بنجاح!";
      toast.success(msg);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تعديل حالة التصنيف"),
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingCategory(null);
    reset({
      name: "",
      slug: "",
      description: "",
      isActive: true,
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    reset({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      isActive: category.isActive !== false,
    });
    setIsDrawerOpen(true);
  };

  const handleFormSubmit = form.handleSubmit((values: any) => {
    saveMutation.mutate(values);
  });

  const columns = createCategoryColumns({
    onEdit: handleOpenEdit,
    onDelete: setDeletingId,
    onActivate: (id) => actionMutation.mutate({ id, action: "activate" }),
    onDeactivate: (id) => actionMutation.mutate({ id, action: "deactivate" }),
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <AdminPageHeader
        title="تصنيفات المدونة"
        description="أنشئ وأدر تصنيفات المقالات لتسهيل الفرز والتصنيف للزوار ومحركات البحث."
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
          <span>إضافة تصنيف جديد</span>
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
        serverSortableColumns={["createdAt", "updatedAt", "name", "order"]}
        filtersValue={{ isActive: queryParams.isActive }}
        onFilterChange={(key, val) => setQueryParams({ isActive: val || "all", page: 1 })}
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchKey="name"
        searchPlaceholder="ابحث عن تصنيف بالاسم..."
        columnLabels={categoryColumnLabels}
        exportFilename="categories_list"
        emptyTitle="لا توجد تصنيفات مضافة"
        emptyDescription="لم يتم العثور على أية تصنيفات مطابقة لخيارات الفرز الحالية. ابدأ وأنشئ أول تصنيف لمقالاتك!"
        filterOptions={[
          {
            key: "isActive",
            label: "الحالات",
            options: [
              { label: "المعطلة", value: "inactive" },
              { label: "النشطة", value: "active" },
            ],
          },
        ]}
      />

      {/* 1. Form Slide-over Drawer */}
      <ResourceFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingCategory ? "تعديل تصنيف المدونة" : "إضافة تصنيف جديد"}
        description={editingCategory ? "تحديث حقول التصنيف والوصف والحالة." : "املأ الحقول لإنشاء تصنيف مقالات جديد في المدونة."}
        onSubmit={handleFormSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <CategoryForm form={form} onSubmit={handleFormSubmit} />
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
        title="حذف التصنيف نهائياً؟"
        description="هل أنت متأكد من رغبتك في حذف هذا التصنيف نهائياً؟ لا يمكن التراجع عن هذا الإجراء، وقد يؤثر على تصنيف المقالات المرتبطة به!"
        confirmText="نعم، حذف نهائي"
        cancelText="إلغاء التراجع"
        variant="danger"
        isSubmitting={deleteMutation.isPending}
      />
    </div>
  );
}
