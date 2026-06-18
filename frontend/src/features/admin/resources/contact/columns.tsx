"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Mail, Phone, Eye, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export type ContactMessage = {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived" | "spam";
  createdAt: string;
};

export const contactColumnLabels: Record<string, string> = {
  fullName: "المرسل",
  email: "البريد الإلكتروني",
  subject: "الموضوع",
  status: "الحالة",
  createdAt: "تاريخ الاستلام",
};

interface CreateColumnsProps {
  onView: (message: ContactMessage) => void;
  onMarkRead?: (id: string) => void;
  onMarkReplied?: (id: string) => void;
}

export function createContactColumns({
  onView,
  onMarkRead,
  onMarkReplied,
}: CreateColumnsProps): ColumnDef<ContactMessage>[] {
  return [
    // 1. Selection Checkbox
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          className="rounded border-border text-primary focus:ring-primary h-4 w-4 cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // 2. Sender Name & Email
    {
      accessorKey: "fullName",
      header: "المرسل",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col text-right max-w-[200px]">
            <span className="font-bold text-foreground truncate">{row.original.fullName}</span>
            <span className="text-[10px] text-muted-foreground truncate font-mono" dir="ltr">
              {row.original.email}
            </span>
          </div>
        );
      },
    },

    // 3. Subject
    {
      accessorKey: "subject",
      header: "موضوع الرسالة",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-foreground line-clamp-1 max-w-xs">
          {row.original.subject}
        </span>
      ),
    },

    // 4. Time Received
    {
      accessorKey: "createdAt",
      header: "تاريخ الاستلام",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-xs text-muted-foreground font-mono">
            {date.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        );
      },
    },

    // 5. Message Status
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.original.status || "new";
        return (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold select-none",
              status === "replied"
                ? "bg-emerald-500/10 text-emerald-500"
                : status === "read"
                ? "bg-blue-500/10 text-blue-500"
                : status === "new"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-muted text-muted-foreground"
            )}
          >
            {status === "replied" ? (
              <CheckCircle2 className="h-3 w-3 shrink-0" />
            ) : status === "read" ? (
              <Eye className="h-3 w-3 shrink-0" />
            ) : (
              <AlertCircle className="h-3 w-3 shrink-0" />
            )}
            <span>
              {status === "replied" ? "تم الرد" : status === "read" ? "مقروءة" : status === "new" ? "غير مقروءة" : status}
            </span>
          </span>
        );
      },
    },

    // 6. Actions
    {
      id: "actions",
      cell: ({ row }) => {
        const msg = row.original;
        const id = msg.id ?? msg._id ?? "";

        return (
          <DropdownMenuPrimitive.Root>
            <DropdownMenuPrimitive.Trigger asChild>
              <button className="h-8 w-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none outline-none">
                <MoreHorizontal className="h-4.5 w-4.5" />
              </button>
            </DropdownMenuPrimitive.Trigger>

            <DropdownMenuPrimitive.Portal>
              <DropdownMenuPrimitive.Content
                className="z-50 min-w-[150px] overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95 align-start"
                align="start"
              >
                <div className="space-y-0.5 text-right" dir="rtl">
                  {/* View Details */}
                  <DropdownMenuPrimitive.Item
                    onClick={() => onView(msg)}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer outline-none select-none"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>عرض كامل الرسالة</span>
                  </DropdownMenuPrimitive.Item>

                  {/* Mail to client */}
                  <DropdownMenuPrimitive.Item asChild>
                    <a
                      href={`mailto:${msg.email}`}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted outline-none select-none"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      <span>إرسال بريد إلكتروني</span>
                    </a>
                  </DropdownMenuPrimitive.Item>

                  {/* Phone call to client */}
                  {msg.phone && (
                    <DropdownMenuPrimitive.Item asChild>
                      <a
                        href={`tel:${msg.phone}`}
                        className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted outline-none select-none"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>اتصال بالهاتف</span>
                      </a>
                    </DropdownMenuPrimitive.Item>
                  )}

                  <div className="h-px bg-border my-1" />

                  {/* Mark as read */}
                  {onMarkRead && msg.status === "new" && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onMarkRead(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-blue-500 hover:bg-blue-500/10 cursor-pointer outline-none select-none"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>تمييز كمقروءة</span>
                    </DropdownMenuPrimitive.Item>
                  )}

                  {/* Mark as replied */}
                  {onMarkReplied && msg.status !== "replied" && (
                    <DropdownMenuPrimitive.Item
                      onClick={() => onMarkReplied(id)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 cursor-pointer outline-none select-none"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>تم الرد عليها</span>
                    </DropdownMenuPrimitive.Item>
                  )}
                </div>
              </DropdownMenuPrimitive.Content>
            </DropdownMenuPrimitive.Portal>
          </DropdownMenuPrimitive.Root>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
