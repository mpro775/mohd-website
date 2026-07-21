import type { CertificationValidityStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const labels: Record<CertificationValidityStatus, string> = {
  "no-expiry": "لا تنتهي",
  active: "سارية",
  expired: "منتهية",
  unknown: "غير محددة",
};

export function CertificationValidityBadge({ status = "unknown" }: { status?: CertificationValidityStatus }) {
  return (
    <span className={cn(
      "inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",
      status === "active" && "bg-emerald-500/10 text-emerald-500",
      status === "expired" && "bg-red-500/10 text-red-500",
      status === "no-expiry" && "bg-sky-500/10 text-sky-500",
      status === "unknown" && "bg-muted text-muted-foreground",
    )}>
      {labels[status]}
    </span>
  );
}
