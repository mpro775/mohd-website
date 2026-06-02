"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";

export type AuditLog = {
  id?: string;
  _id?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  payload?: any;
  details?: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
  } | null;
};

export const auditColumnLabels: Record<string, string> = {
  action: "العملية",
  resource: "المورد المتأثر",
  user: "المسؤول / المشرف",
  ipAddress: "عنوان IP",
  createdAt: "التاريخ والوقت",
};

interface CreateColumnsProps {
  onView: (log: AuditLog) => void;
}

const actionLabels: Record<string, string> = {
  CREATE: "إنشاء (Create)",
  UPDATE: "تحديث (Update)",
  DELETE: "حذف (Delete)",
  LOGIN: "تسجيل دخول (Login)",
  PUBLISH: "نشر (Publish)",
  UNPUBLISH: "إلغاء نشر (Unpublish)",
};

const actionColors: Record<string, string> = {
  CREATE: "bg-emerald-500/10 text-emerald-500",
  UPDATE: "bg-blue-500/10 text-blue-500",
  DELETE: "bg-danger/10 text-danger",
  LOGIN: "bg-purple-500/10 text-purple-500",
  PUBLISH: "bg-teal-500/10 text-teal-500",
  UNPUBLISH: "bg-amber-500/10 text-amber-500",
};

export function createAuditColumns({ onView }: CreateColumnsProps): ColumnDef<AuditLog>[] {
  return [
    // 1. Action Badge
    {
      accessorKey: "action",
      header: "العملية",
      cell: ({ row }) => {
        const action = row.original.action || "Activity";
        const label = actionLabels[action] || action;
        const colorClass = actionColors[action] || "bg-muted text-muted-foreground";
        return (
          <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold select-none", colorClass)}>
            {label}
          </span>
        );
      },
    },

    // 2. Resource Name
    {
      accessorKey: "resource",
      header: "المورد / القسم",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground font-mono bg-secondary/10 px-2 py-0.5 rounded">
          {row.original.resource}
        </span>
      ),
    },

    // 3. User Actor
    {
      id: "user",
      header: "المسؤول",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) return <span className="text-xs text-muted-foreground italic">عملية تلقائية / زائر</span>;
        return (
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-foreground">{user.fullName}</span>
            <span className="text-[10px] text-muted-foreground font-mono" dir="ltr">{user.email}</span>
          </div>
        );
      },
    },

    // 4. IP Address
    {
      accessorKey: "ipAddress",
      header: "عنوان IP",
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.original.ipAddress || "-"}
        </span>
      ),
    },

    // 5. Timestamp
    {
      accessorKey: "createdAt",
      header: "الوقت والتاريخ",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-xs text-muted-foreground font-mono" dir="ltr">
            {date.toLocaleDateString("ar-EG", { year: "numeric", month: "numeric", day: "numeric" })} {date.toLocaleTimeString("ar-EG", { hour: "numeric", minute: "numeric" })}
          </span>
        );
      },
    },

    // 6. View Details
    {
      id: "view",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <button
            onClick={() => onView(log)}
            className="h-8 px-2.5 rounded-lg border border-border flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none outline-none text-xs font-bold"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>عرض السجل</span>
          </button>
        );
      },
    },
  ];
}
