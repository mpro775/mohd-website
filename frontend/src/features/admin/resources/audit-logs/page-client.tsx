"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { RefreshCw, Shield, Clock, Terminal, Globe, Server } from "lucide-react";

import { adminClient } from "@/lib/api/admin-client";
import { adminQueryKeys } from "@/lib/api/admin-query-keys";
import { adminSearchParamsSchema } from "@/lib/api/admin-search-params";
import type { AuditLog } from "./columns";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/data-table/DataTable";
import { createAuditColumns, auditColumnLabels } from "./columns";
import { ResourceFormDrawer } from "@/components/admin/forms/ResourceFormDrawer";

export function AuditLogsPageClient() {
  const [queryParams] = useQueryStates(adminSearchParamsSchema);

  // States
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 1. Fetch Audit logs list
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("audit-logs", queryParams),
    queryFn: () =>
      adminClient.listResource<AuditLog>("audit-logs", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        status: queryParams.status === "all" ? undefined : queryParams.status,
      }),
  });

  // Handlers
  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const columns = createAuditColumns({
    onView: handleViewLog,
  });

  const formattedDate = selectedLog
    ? new Date(selectedLog.createdAt).toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    : "";

  // Helper to format payload beautifully
  const renderPayload = (payload: any) => {
    if (!payload) return null;
    try {
      const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
      return JSON.stringify(parsed, null, 2);
    } catch {
      return String(payload);
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <AdminPageHeader
        title="سجل العمليات والتدقيق (Audit Logs)"
        description="تتبع كافة التعديلات، وعمليات الحذف والإنشاء، وتحقّق من عناوين IP والأجهزة المرتبطة بإجراءات المشرفين."
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
        columns={columns}
        data={data?.items || []}
        isLoading={isLoading}
        searchKey="resource"
        searchPlaceholder="ابحث باسم المورد المتأثر (مثال: Post)..."
        columnLabels={auditColumnLabels}
        exportFilename="audit_logs"
        emptyTitle="لا توجد سجلات تدقيق"
        emptyDescription="صندوق التدقيق الأمني فارغ تماماً حالياً! لم يتم تدوين أية حركات أو عمليات في قاعدة البيانات."
      />

      {/* Log Details Viewer Drawer */}
      <ResourceFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="تفاصيل العملية الأمنية"
        description="تفاصيل فنية كاملة حول الإجراء المتخذ، والمسؤول، والبيانات المتأثرة."
        isSubmitting={false}
        onSubmit={() => {}}
      >
        {selectedLog && (
          <div className="space-y-6 text-right" dir="rtl">
            {/* Action and User card */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">العملية والمشرف</span>
                  <span className="font-bold text-foreground text-sm">
                    {selectedLog.action} - {selectedLog.user?.fullName || "مشرف مجهول"}
                  </span>
                </div>
              </div>

              <div className="h-px bg-border/40" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground font-mono" dir="ltr">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span>{formattedDate}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground font-mono" dir="ltr">
                  <Server className="h-4 w-4 text-primary shrink-0" />
                  <span>IP: {selectedLog.ipAddress || "بلا عنوان"}</span>
                </div>
              </div>
            </div>

            {/* Affected resource info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground">المورد المتأثر:</span>
                <div className="rounded-lg border border-border bg-card p-2.5 font-semibold text-foreground text-xs font-mono">
                  {selectedLog.resource}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-muted-foreground">معرّف المورد المتأثر:</span>
                <div className="rounded-lg border border-border bg-card p-2.5 font-semibold text-foreground text-xs font-mono" dir="ltr">
                  {selectedLog.resourceId || "NULL"}
                </div>
              </div>
            </div>

            {/* Device UserAgent */}
            {selectedLog.userAgent && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>بصمة المتصفح وجهاز العميل (User Agent):</span>
                </span>
                <div className="rounded-lg border border-border bg-card p-3 font-mono text-[10px] text-muted-foreground leading-normal whitespace-normal break-all" dir="ltr">
                  {selectedLog.userAgent}
                </div>
              </div>
            )}

            {/* JSON payload inspector */}
            {(selectedLog.payload || selectedLog.details) && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>حزمة البيانات المُرسلة (Payload Data JSON):</span>
                </span>
                <div className="relative overflow-hidden rounded-xl border border-border bg-muted/60">
                  <pre
                    className="p-4 font-mono text-xs text-foreground overflow-auto max-h-[300px] leading-relaxed whitespace-pre"
                    dir="ltr"
                  >
                    {renderPayload(selectedLog.payload || selectedLog.details)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </ResourceFormDrawer>
    </div>
  );
}
