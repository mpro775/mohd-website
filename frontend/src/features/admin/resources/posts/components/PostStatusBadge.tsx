"use client";

import { Archive, CalendarClock, CheckCircle2, CircleDot, Clock3, FileEdit, MessageSquareWarning } from "lucide-react";
import type { PostStatus } from "@/lib/api/types";

const config: Record<PostStatus, { label: string; className: string; icon: typeof FileEdit }> = {
  draft: { label: "مسودة", className: "bg-muted text-muted-foreground", icon: FileEdit },
  in_review: { label: "قيد المراجعة", className: "bg-blue-500/10 text-blue-500", icon: Clock3 },
  changes_requested: { label: "مطلوب تعديل", className: "bg-orange-500/10 text-orange-500", icon: MessageSquareWarning },
  approved: { label: "معتمد", className: "bg-emerald-500/10 text-emerald-500", icon: CheckCircle2 },
  scheduled: { label: "مجدول", className: "bg-violet-500/10 text-violet-500", icon: CalendarClock },
  published: { label: "منشور", className: "bg-green-500/10 text-green-500", icon: CircleDot },
  archived: { label: "مؤرشف", className: "bg-zinc-500/10 text-zinc-500", icon: Archive },
};

export function PostStatusBadge({ status = "draft" }: { status?: PostStatus }) {
  const item = config[status] ?? config.draft;
  const Icon = item.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${item.className}`} data-status={status}>
      <Icon className="h-3.5 w-3.5" />
      {item.label}
    </span>
  );
}

export { config as postStatusConfig };
