"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { RefreshCw, Mail, Phone, Calendar, Check } from "lucide-react";
import { toast } from "sonner";

import { adminClient, clientApiRequest } from "@/lib/api/admin-client";
import { adminQueryKeys } from "@/lib/api/admin-query-keys";
import { handleAdminError } from "@/lib/api/admin-errors";
import { adminSearchParamsSchema } from "@/lib/api/admin-search-params";
import type { ContactMessage } from "./columns";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { createContactColumns, contactColumnLabels } from "./columns";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";

export function ContactPageClient() {
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useQueryStates(adminSearchParamsSchema);

  // States
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Fetch Contact messages list
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("contact/messages", queryParams),
    queryFn: () =>
      adminClient.listResource<ContactMessage>("contact/messages", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        status: queryParams.status === "all" ? undefined : queryParams.status,
        sortBy: queryParams.sortBy || "createdAt",
        sortOrder: queryParams.sortOrder || "desc",
      }),
  });

  const invalidateKeys = () => {
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("contact/messages") });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
  };

  // 2. Status Mutation (Mark as Read / Mark as Replied)
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "read" | "replied" }) => {
      return clientApiRequest(`contact/messages/${id}/status`, {
        method: "PATCH",
        body: { status },
      });
    },
    onSuccess: (res: any, variables) => {
      const label = variables.status === "read" ? "مقروءة" : "تم الرد عليها";
      toast.success(`تم تمييز الرسالة كـ ${label} بنجاح!`);
      
      // Update local drawer state if open
      if (selectedMessage && (selectedMessage.id === variables.id || selectedMessage._id === variables.id)) {
        setSelectedMessage({
          ...selectedMessage,
          status: variables.status,
        });
      }
      
      invalidateKeys();
    },
    onError: (err) => handleAdminError(err, "فشل تحديث حالة الرسالة"),
  });

  // Handlers
  const handleViewMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setIsDrawerOpen(true);

    // If message is new, automatically mark it as read upon opening
    const id = msg.id ?? msg._id;
    if (id && msg.status === "new") {
      statusMutation.mutate({ id, status: "read" });
    }
  };

  const columns = createContactColumns({
    onView: handleViewMessage,
    onMarkRead: (id) => statusMutation.mutate({ id, status: "read" }),
    onMarkReplied: (id) => statusMutation.mutate({ id, status: "replied" }),
  });

  const selectedId = selectedMessage?.id ?? selectedMessage?._id ?? "";
  const formattedDate = selectedMessage
    ? new Date(selectedMessage.createdAt).toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : "";

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <AdminPageHeader
        title="علبة الرسائل الواردة"
        description="تلقّ وقس رسائل عملائك وزوار موقعك الخارجي، وقم بإدارتها وتصنيفها والرد عليها."
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
        serverSortableColumns={["createdAt", "updatedAt", "fullName", "email", "status"]}
        filtersValue={{ status: queryParams.status }}
        onFilterChange={(key, val) => setQueryParams({ [key]: val || undefined, page: 1 })}
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchKey="fullName"
        searchPlaceholder="ابحث باسم المرسل..."
        columnLabels={contactColumnLabels}
        exportFilename="contact_inbox"
        emptyTitle="صندوق الوارد فارغ"
        emptyDescription="لم يتم العثور على أية رسائل متوافقة للفرز الحالي. كل شيء يبدو هادئاً ومثاليًا هنا!"
        filterOptions={[
          {
            key: "status",
            label: "الحالات",
            options: [
              { label: "غير مقروءة (New)", value: "new" },
              { label: "مقروءة (Read)", value: "read" },
              { label: "تم الرد (Replied)", value: "replied" },
              { label: "مؤرشفة (Archived)", value: "archived" },
              { label: "مزعجة (Spam)", value: "spam" },
            ],
          },
        ]}
      />

      {/* Message Viewer Drawer */}
      <ResourceFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="قراءة رسالة العميل"
        description="محتوى استفسار العميل وقنوات التواصل المتاحة للرد المباشر."
        isSubmitting={false}
        onSubmit={() => {}}
      >
        {selectedMessage && (
          <div className="space-y-6 text-right" dir="rtl">
            {/* Sender card info */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                  {selectedMessage.fullName.substring(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground text-sm">{selectedMessage.fullName}</span>
                  <span className="text-xs text-muted-foreground font-mono" dir="ltr">{selectedMessage.email}</span>
                </div>
              </div>

              <div className="h-px bg-border/40" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span>{formattedDate}</span>
                </div>

                {selectedMessage.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground font-mono" dir="ltr">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>{selectedMessage.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Message Body Content */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground">الموضوع / العنوان:</span>
              <div className="rounded-xl border border-border bg-card p-3 font-semibold text-foreground text-sm">
                {selectedMessage.subject}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground">نص الرسالة والاستفسار:</span>
              <div className="rounded-xl border border-border bg-card p-4 text-foreground text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {selectedMessage.message}
              </div>
            </div>

            {/* Quick Actions Drawer Buttons */}
            <div className="pt-4 border-t border-border/40 space-y-3">
              <span className="text-xs font-bold text-muted-foreground">اتخاذ إجراء فوري:</span>
              <div className="flex flex-wrap gap-2">
                {selectedMessage.status !== "replied" && (
                  <button
                    onClick={() => statusMutation.mutate({ id: selectedId, status: "replied" })}
                    disabled={statusMutation.isPending}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-bold text-white hover:bg-emerald-500 cursor-pointer transition select-none disabled:opacity-50 shadow-sm"
                  >
                    <Check className="h-4 w-4" />
                    <span>تمييز كتم الرد</span>
                  </button>
                )}

                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 cursor-pointer transition select-none shadow-sm"
                >
                  <Mail className="h-4 w-4" />
                  <span>رد بالبريد الإلكتروني</span>
                </a>

                {selectedMessage.phone && (
                  <a
                    href={`tel:${selectedMessage.phone}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>اتصال بالهاتف</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </ResourceFormDrawer>
    </div>
  );
}
