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
import type { Post } from "@/lib/api/types";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { createPostColumns, postColumnLabels } from "./columns";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";
import { PostForm } from "./form";
import { postFormSchema, PostFormValues } from "./schema";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

export function PostsPageClient() {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useQueryStates(adminSearchParamsSchema);

  // Modal and drawers states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // React Hook Form initialization
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      excerpt: "",
      content: "",
      category: "",
      tags: [],
      status: "draft",
      featuredImageMediaId: null,
      featuredImage: null,
      coverImageMediaId: null,
      coverImage: null,
      publishDate: null,
      scheduledAt: null,
      readTime: null,
      isFeatured: false,
      allowIndexing: true,
      canonicalUrl: "",
      seo: {
        metaTitle: "",
        metaDescription: "",
        ogImageMediaId: null,
        ogImage: null,
      },
    },
  });

  const { reset, setError } = form;

  // 1. Fetch posts list
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("blog/posts", queryParams),
    queryFn: () =>
      adminClient.listResource<Post>("blog/posts", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        status: queryParams.status === "all" ? undefined : queryParams.status,
        sortBy: queryParams.sortBy || "createdAt",
        sortOrder: queryParams.sortOrder || "desc",
      }),
  });

  // 2. Mutations
  const invalidateKeys = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("blog/posts") });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
    adminClient.revalidate(["blog"]);
  };

  // Create or Update
  const saveMutation = useMutation({
    mutationFn: async (values: PostFormValues) => {
      const payload = {
        title: values.title,
        slug: values.slug || undefined,
        summary: values.summary,
        excerpt: values.excerpt || undefined,
        content: values.content,
        category: values.category || undefined,
        tags: values.tags || [],
        status: values.status,
        featuredImageMediaId: values.featuredImageMediaId || null,
        coverImageMediaId: values.coverImageMediaId || null,
        publishDate: values.publishDate || undefined,
        scheduledAt: values.scheduledAt || undefined,
        readTime: values.readTime === "" ? undefined : values.readTime ?? undefined,
        isFeatured: !!values.isFeatured,
        allowIndexing: !!values.allowIndexing,
        canonicalUrl: values.canonicalUrl || undefined,
        seo: values.seo
          ? {
              metaTitle: values.seo.metaTitle || undefined,
              metaDescription: values.seo.metaDescription || undefined,
              ogImageMediaId: values.seo.ogImageMediaId || null,
            }
          : undefined,
      };

      if (editingPost) {
        const id = editingPost.id ?? editingPost._id ?? "";
        return adminClient.updateResource<Post>("blog/posts", id, payload);
      } else {
        return adminClient.createResource<Post>("blog/posts", payload);
      }
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "تم حفظ بيانات المقال بنجاح!");
      setIsDrawerOpen(false);
      invalidateKeys();
    },
    onError: (err) => {
      const isValidationMapped = setFormErrors(err, setError);
      if (!isValidationMapped) {
        handleAdminError(err, "فشل حفظ بيانات المقال. يرجى مراجعة المدخلات.");
      }
    },
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminClient.deleteResource("blog/posts", id),
    onSuccess: () => {
      toast.success("تم حذف المقال نهائياً بنجاح");
      setDeletingId(null);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل حذف المقال المهمل"),
  });

  // Individual Actions (Publish, Unpublish, Archive)
  const patchActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: "publish" | "unpublish" | "archive" }) => {
      return adminClient.patchResource<Post>("blog/posts", `${id}/${action}`);
    },
    onSuccess: (_, variables) => {
      const actionsMap = {
        publish: "تم نشر المقال بنجاح!",
        unpublish: "تم إلغاء النشر بنجاح!",
        archive: "تم أرشفة المقال بنجاح!",
      };
      toast.success(actionsMap[variables.action]);
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تعديل حالة المقال"),
  });

  // Bulk Actions
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: string; ids: string[] }) => {
      return adminClient.bulkAction("blog/posts", action, ids);
    },
    onSuccess: (_, variables) => {
      const actionsMap: Record<string, string> = {
        publish: "تم نشر جميع المقالات المحددة بنجاح!",
        unpublish: "تم إلغاء النشر لجميع المقالات المحددة!",
        archive: "تم أرشفة جميع المقالات المحددة بنجاح!",
        delete: "تم حذف جميع المقالات المحددة بنجاح!",
      };
      toast.success(actionsMap[variables.action] || "تم إكمال الإجراء الجماعي بنجاح");
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل إتمام الإجراء الجماعي للمقالات"),
  });

  // Handlers
  const handleOpenCreate = () => {
    setEditingPost(null);
    reset({
      title: "",
      slug: "",
      summary: "",
      excerpt: "",
      content: "",
      category: "",
      tags: [],
      status: "draft",
      featuredImageMediaId: null,
      featuredImage: null,
      coverImageMediaId: null,
      coverImage: null,
      publishDate: null,
      scheduledAt: null,
      readTime: null,
      isFeatured: false,
      allowIndexing: true,
      canonicalUrl: "",
      seo: {
        metaTitle: "",
        metaDescription: "",
        ogImageMediaId: null,
        ogImage: null,
      },
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (post: Post) => {
    setEditingPost(post);
    
    // Resolve category ID format
    const categoryId = post.category 
      ? typeof post.category === "string" 
        ? post.category 
        : (post.category as any).id ?? (post.category as any)._id ?? ""
      : "";

    // Resolve tags IDs list format
    const tagsIds = (post.tags || []).map((tag: any) =>
      typeof tag === "string" ? tag : tag.id ?? tag._id ?? ""
    );

    reset({
      title: post.title || "",
      slug: post.slug || "",
      summary: post.summary || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      category: categoryId,
      tags: tagsIds,
      status: post.status || "draft",
      featuredImageMediaId: post.featuredImageMediaId || null,
      featuredImage: post.featuredImage || null,
      coverImageMediaId: post.coverImageMediaId || null,
      coverImage: post.coverImage || null,
      publishDate: post.publishDate ? post.publishDate.slice(0, 16) : null,
      scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : null,
      readTime: post.readTime || null,
      isFeatured: post.isFeatured || false,
      allowIndexing: post.allowIndexing !== false,
      canonicalUrl: post.canonicalUrl || "",
      seo: {
        metaTitle: post.seo?.metaTitle || "",
        metaDescription: post.seo?.metaDescription || "",
        ogImageMediaId: post.seo?.ogImageMediaId || null,
        ogImage: post.seo?.ogImage || null,
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

  const columns = createPostColumns({
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
        title="إدارة المقالات"
        description="أنشئ وحرر مقالات المدونة، ورتب حالتها وتابع المشاهدات والأرشفة بكل سهولة."
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
          <span>إضافة مقال جديد</span>
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
        serverSortableColumns={["createdAt", "updatedAt", "publishDate", "title", "views", "readTime"]}
        filtersValue={{ status: queryParams.status }}
        onFilterChange={(key, val) => setQueryParams({ [key]: val || undefined, page: 1 })}
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchKey="title"
        searchPlaceholder="ابحث عن مقال بالاسم..."
        columnLabels={postColumnLabels}
        exportFilename="blog_posts"
        emptyTitle="لا توجد مقالات مضافة"
        emptyDescription="لم يتم العثور على أية مقالات متطابقة لخيارات الفرز الحالية. يمكنك البدء بإضافة مقالك الأول!"
        filterOptions={[
          {
            key: "status",
            label: "الحالات",
            options: [
              { label: "المسودات", value: "draft" },
              { label: "المنشورة", value: "published" },
              { label: "المجدولة", value: "scheduled" },
              { label: "المؤرشفة", value: "archived" },
            ],
          },
        ]}
        bulkActions={[
          { action: "publish", label: "نشر المحدد", variant: "primary" },
          { action: "unpublish", label: "إلغاء نشر المحدد", variant: "warning" },
          { action: "archive", label: "أرشفة المحدد" },
          { action: "delete", label: "حذف المحدد نهائياً", variant: "danger" },
        ]}
        onBulkAction={handleBulkAction}
      />

      {/* 1. Form Slide-over Drawer (Add/Edit) */}
      <ResourceFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={editingPost ? "تعديل مقال المدونة" : "إضافة مقال جديد للمدونة"}
        description={editingPost ? "تحديث حقول المقال وتاريخ النشر ووسائط الـ SEO." : "املأ الحقول لإنشاء مقال وتوزيعه بالوسوم والتصنيفات."}
        onSubmit={handleFormSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <PostForm form={form} onSubmit={handleFormSubmit} />
      </ResourceFormDrawer>

      {/* 2. Safe Delete confirmation alert */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="حذف المقال نهائياً؟"
        description="هل أنت متأكد من رغبتك في إزالة هذا المقال نهائياً من الخادم ومحركات البحث؟ لا يمكن التراجع عن هذا الإجراء!"
        confirmText="نعم، حذف نهائي"
        cancelText="إلغاء التراجع"
        variant="danger"
        isSubmitting={deleteMutation.isPending}
      />
    </div>
  );
}
