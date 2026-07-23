"use client";

import * as Popover from "@radix-ui/react-popover";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import type { ReadinessResult } from "@/lib/api/types";

export function BlogPublishReadinessPopover({
  result,
  onRefresh,
}: {
  result: ReadinessResult | null;
  onRefresh: () => void;
}) {
  const ready = Boolean(result?.ready);
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button type="button" className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold ${ready ? "border-emerald-500/30 text-emerald-500" : "border-border text-muted-foreground"}`}>
          {ready ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          <span className="hidden lg:inline">{ready ? "جاهز للنشر" : "الجاهزية"}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content dir="rtl" sideOffset={8} className="z-[80] w-72 rounded-xl border border-border bg-card p-4 shadow-xl">
          <p className="font-bold">جاهزية النشر</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {result ? `${result.checks.filter((item) => item.passed).length} من ${result.checks.length} فحوصات مكتملة` : "لم يُشغّل الفحص بعد."}
          </p>
          <button type="button" onClick={onRefresh} className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-xs font-bold">إعادة الفحص</button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
