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
import type { Project } from "@/lib/api/types";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { createProjectColumns, projectColumnLabels } from "./columns";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";
import { ProjectForm } from "./form";
import { projectFormSchema, ProjectFormValues } from "./schema";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function ProjectsPageClient() {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useQueryStates(adminSearchParamsSchema);

  // Modal and drawers states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // React Hook Form initialization
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      category: "web-app",
      status: "completed",
      shortDescription: "",
      detailedDescription: "",
      technologySlugs: [],
      coverImageMediaId: null,
      coverImage: null,
      liveUrl: "",
      githubUrl: "",
      isPublished: true,
      featured: false,
      clientName: "",
      startDate: "",
      endDate: "",
      completionDate: "",
      galleryMediaIds: [],
      gallery: [],
      caseStudy: "",
      problem: "",
      solution: "",
      results: "",
      role: "",
      seo: {
        metaTitle: "",
        metaDescription: "",
        ogImageMediaId: null,
        ogImage: null,
      },
    },
  });

  const { reset, setError } = form;

  // 1. Fetch projects list
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("projects", queryParams),
    queryFn: () =>
      adminClient.listResource<Project>("projects", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        status: queryParams.status === "all" ? undefined : queryParams.status,
        category: queryParams.category || undefined,
        sortBy: queryParams.sortBy || "createdAt",
        sortOrder: queryParams.sortOrder || "desc",
      }),
  });

  // 2. Mutations
  const invalidateKeys = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("projects") });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
    adminClient.revalidate(["projects", "home"]);
  };

  // Create or Update
  const saveMutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const payload = {
        title: values.title,
        slug: values.slug || undefined,
        category: values.category,
        status: values.status,
        shortDescription: values.shortDescription,
        detailedDescription: values.detailedDescription,
        technologySlugs: values.technologySlugs || [],
        coverImageMediaId: values.coverImageMediaId || null,
        liveUrl: values.liveUrl || undefined,
        githubUrl: values.githubUrl || undefined,
        isPublished: !!values.isPublished,
        featured: !!values.featured,
        clientName: values.clientName || undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        completionDate: values.completionDate || undefined,
        galleryMediaIds: values.galleryMediaIds || [],
        caseStudy: values.caseStudy || undefined,
        problem: values.problem || undefined,
        solution: values.solution || undefined,
        results: values.results || undefined,
        role: values.role || undefined,
        seo: values.seo
          ? {
              metaTitle: values.seo.metaTitle || undefined,
              metaDescription: values.seo.metaDescription || undefined,
              ogImageMediaId: values.seo.ogImageMediaId || null,
            }
          : undefined,
      };

      if (editingProject) {
        const id = editingProject.id ?? editingProject._id ?? "";
        return adminClient.updateResource<Project>("projects", id, payload);
      } else {
        return adminClient.createResource<Project>("projects", payload);
      }
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "تم حفظ بيانات المشروع بنجاح!");
      setIsDrawerOpen(false);
      invalidateKeys();
    },
    onError: (err) => {
      const isValidationMapped = setFormErrors(err, setError);
      if (!isValidationMapped) {
        handleAdminError(err, "فشل حفظ بيانات المشروع. يرجى مراجعة المدخلات.");
      }
    },
  });

  // Delete (Archives project)
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminClient.deleteResource("projects", id),
    onSuccess: () => {
      toast.success("تم أرشفة المشروع بنجاح");
      setDeletingId(null);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل أرشفة المشروع"),
  });

  // Individual Actions (Publish, Unpublish, Archive)
  const patchActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "publish" | "unpublish" | "archive" }) => {
      return adminClient.patchResource<Project>("projects", `${id}/${action}`);
    },
    onSuccess: (_, variables) => {
      const actionsMap = {
        publish: "تم نشر المشروع بنجاح!",
        unpublish: "تم إلغاء النشر بنجاح!",
        archive: "تم أرشفة المشروع بنجاح!",
      };
      toast.success(actionsMap[variables.action]);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تعديل حالة المشروع"),
  });

  // Bulk Actions
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
      return adminClient.bulkAction("projects", action, ids);
    },
    onSuccess: (_, variables) => {
      const actionsMap: Record<string, string> = {
        publish: "تم نشر جميع المشاريع المحددة بنجاح!",
        unpublish: "تم إلغاء النشر لجميع المشاريع المحددة!",
        archive: "تم أرشفة جميع المشاريع المحددة بنجاح!",
        delete: "تم حذف جميع المشاريع المحددة بنجاح!",
      };
      toast.success(actionsMap[variables.action] || "تم إكمال الإجراء الجماعي بنجاح");
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل إتمام الإجراء الجماعي للمشاريع"),
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingProject(null);
    reset({
      title: "",
      slug: "",
      category: "web-app",
      status: "completed",
      shortDescription: "",
      detailedDescription: "",
      technologySlugs: [],
      coverImageMediaId: null,
      coverImage: null,
      liveUrl: "",
      githubUrl: "",
      isPublished: true,
      featured: false,
      clientName: "",
      startDate: "",
      endDate: "",
      completionDate: "",
      galleryMediaIds: [],
      gallery: [],
      caseStudy: "",
      problem: "",
      solution: "",
      results: "",
      role: "",
      seo: {
        metaTitle: "",
        metaDescription: "",
        ogImageMediaId: null,
        ogImage: null,
      },
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    reset({
      title: project.title || "",
      slug: project.slug || "",
      category: project.category || "web-app",
      status: project.status || "completed",
      shortDescription: project.shortDescription || "",
      detailedDescription: project.detailedDescription || "",
      technologySlugs: project.technologySlugs || [],
      coverImageMediaId: project.coverImageMediaId || null,
      coverImage: project.coverImage || null,
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      isPublished: project.isPublished !== false,
      featured: project.featured === true,
      clientName: (project as any).clientName || "",
      startDate: (project as any).startDate ? new Date((project as any).startDate).toISOString().split('T')[0] : "",
      endDate: (project as any).endDate ? new Date((project as any).endDate).toISOString().split('T')[0] : "",
      completionDate: project.completionDate ? new Date(project.completionDate).toISOString().split('T')[0] : "",
      galleryMediaIds: project.galleryMediaIds || [],
      gallery: project.gallery || [],
      caseStudy: project.caseStudy || "",
      problem: project.problem || "",
      solution: project.solution || "",
      results: project.results || "",
      role: project.role || "",
      seo: {
        metaTitle: project.seo?.metaTitle || "",
        metaDescription: project.seo?.metaDescription || "",
        ogImageMediaId: project.seo?.ogImageMediaId || null,
        ogImage: project.seo?.ogImage || null,
      },
    });
    setIsDrawerOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
    }
  };

  const handleFormSubmit = form.handleSubmit((values: any) => {
    saveMutation.mutate(values);
  });

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    bulkActionMutation.mutate({ action, ids: selectedIds });
  };

  const columns = createProjectColumns({
    onEdit: handleOpenEdit,
    onDelete: setDeletingId,
    onPublish: (id) => patchActionMutation.mutate({ id, action: "publish" }),
    onUnpublish: (id) => patchActionMutation.mutate({ id, action: "unpublish" }),
    onArchive: (id) => patchActionMutation.mutate({ id, action: "archive" }),
  });

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <AdminPageHeader
        title="إدارة المشاريع"
        description="تحكم بمعرض أعمالك ومشاريعك المنشورة ودراسات الحالة الخاصة بها بأسلوب راقٍ."
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
          <span>إضافة مشروع جديد</span>
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
        serverSortableColumns={["createdAt", "updatedAt", "order", "completionDate", "title"]}
        filtersValue={{ category: queryParams.category }}
        onFilterChange={(key, val) => setQueryParams({ [key]: val || undefined, page: 1 })}
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="ابحث عن مشروع بالاسم..."
        columnLabels={projectColumnLabels}
        exportFilename="projects_list"
        emptyTitle="لا توجد مشاريع مضافة"
        emptyDescription="لم يتم العثور على أية مشاريع متطابقة للفرز الحالي. ابدأ بإضافة مشروعك الأول لعرضه للجمهور!"
        filterOptions={[
          {
            key: "category",
            label: "التصنيفات",
            options: [
              { label: "تطوير تطبيقات الويب (web-app)", value: "web-app" },
              { label: "تطبيقات الهواتف (mobile-app)", value: "mobile-app" },
              { label: "تصميم واجهات المستخدم (ui-ux)", value: "ui-ux" },
              { label: "منصات البرمجيات SaaS (saas)", value: "saas" },
              { label: "الذكاء الاصطناعي (ai)", value: "ai" },
              { label: "أتمتة العمليات (automation)", value: "automation" },
              { label: "أخرى (other)", value: "other" },
            ],
          },
        ]}
        bulkActions={[
          { action: "publish", label: "نشر المحدد", variant: "primary" },
          { action: "unpublish", label: "إلغاء نشر المحدد", variant: "warning" },
          { action: "archive", label: "أرشفة المحدد", variant: "danger" },
        ]}
        onBulkAction={handleBulkAction}
      />

      {/* 1. Form Slide-over Drawer (Add/Edit) */}
      <ResourceFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingProject ? "تعديل بيانات المشروع" : "إضافة مشروع جديد للمعرض"}
        description={editingProject ? "تحديث حقول المشروع ودراسة الحالة ومعاينة الـ SEO." : "املأ الحقول وصغ دراسة الحالة الكاملة لإبهار عملائك."}
        onSubmit={handleFormSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <ProjectForm form={form} onSubmit={handleFormSubmit} />
      </ResourceFormDrawer>

      {/* 2. Safe Delete confirmation alert */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="أرشفة المشروع؟"
        description="هل أنت متأكد من رغبتك في أرشفة هذا المشروع؟ سيتم إخفاء المشروع من المعرض العام ويمكنك الوصول إليه وإعادة تفعيله لاحقاً."
        confirmText="نعم، أرشفة المشروع"
        cancelText="إلغاء التراجع"
        variant="warning"
        isSubmitting={deleteMutation.isPending}
      />
    </div>
  );
}
