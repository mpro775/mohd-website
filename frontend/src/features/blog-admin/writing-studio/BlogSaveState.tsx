"use client";

import { AlertCircle, Check, Loader2, RefreshCw } from "lucide-react";
import type { AutosaveState } from "../hooks/usePostAutosave";

const labels: Record<AutosaveState, string> = {
  idle: "لا توجد تغييرات",
  dirty: "تغييرات غير محفوظة",
  saving: "جارٍ الحفظ…",
  saved: "تم الحفظ",
  error: "فشل الحفظ",
  conflict: "تعارض في النسخة",
};

export function BlogSaveState({
  state,
  savedAt,
  onRetry,
}: {
  state: AutosaveState;
  savedAt: Date | null;
  onRetry: () => void;
}) {
  const failed = state === "error" || state === "conflict";
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs ${failed ? "text-danger" : "text-muted-foreground"}`}
      aria-live="polite"
      data-state={state}
    >
      {state === "saving" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {state === "saved" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : null}
      {failed ? <AlertCircle className="h-3.5 w-3.5" /> : null}
      <span>
        {labels[state]}
        {state === "saved" && savedAt
          ? ` ${savedAt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}`
          : ""}
      </span>
      {failed ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded p-1 hover:bg-danger/10"
          aria-label="إعادة محاولة الحفظ"
          title="إعادة المحاولة"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
