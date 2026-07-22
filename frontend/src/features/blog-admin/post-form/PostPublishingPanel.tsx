"use client";

import type { AdminPostDetail } from "@/lib/api/types";

const labels: Record<string, string> = {
  draft: "مسودة",
  in_review: "قيد المراجعة",
  changes_requested: "مطلوب تعديل",
  approved: "معتمد",
  scheduled: "مجدول",
  published: "منشور",
  archived: "مؤرشف",
};

export function PostPublishingPanel({
  post,
  scheduleValue,
  onScheduleValue,
  busy,
  onAction,
}: {
  post: AdminPostDetail | null;
  scheduleValue: string;
  onScheduleValue: (value: string) => void;
  busy: boolean;
  onAction: (action: string, payload?: any) => void;
}) {
  const status = post?.status ?? "draft";
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return (
    <section className="premium-card space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">النشر</h2>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-bold">
          {labels[status] ?? status}
        </span>
      </div>
      {post ? (
        <div className="flex flex-col gap-2">
          {["draft", "changes_requested"].includes(status) ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction("submit-review")}
              className="w-full rounded-lg border border-border p-2 text-sm font-bold"
            >
              إرسال للمراجعة
            </button>
          ) : null}

          {status === "in_review" ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => onAction("approve")}
                className="w-full rounded-lg bg-green-600/10 text-green-600 p-2 text-sm font-bold"
              >
                اعتماد
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  const msg = window.prompt("اكتب رسالة التعديلات المطلوبة:");
                  if (msg) onAction("request-changes", { message: msg });
                }}
                className="w-full rounded-lg border border-border p-2 text-sm font-bold text-amber-600"
              >
                طلب تعديل
              </button>
            </>
          ) : null}

          {["draft", "in_review", "approved"].includes(status) ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction("publish")}
              className="w-full rounded-lg bg-primary p-2 text-sm font-bold text-primary-foreground"
            >
              نشر الآن
            </button>
          ) : null}

          {status === "published" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction("unpublish")}
              className="w-full rounded-lg border border-border p-2 text-sm font-bold"
            >
              إلغاء النشر
            </button>
          ) : null}

          {status === "scheduled" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction("cancel-schedule")}
              className="w-full rounded-lg border border-border p-2 text-sm font-bold"
            >
              إلغاء الجدولة
            </button>
          ) : null}

          {["draft", "scheduled", "published"].includes(status) ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm("هل أنت متأكد من أرشفة المقال؟")) {
                  onAction("archive");
                }
              }}
              className="w-full rounded-lg border border-border p-2 text-sm font-bold text-danger"
            >
              أرشفة المقال
            </button>
          ) : null}

          {status === "archived" ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onAction("unpublish")}
              className="w-full rounded-lg border border-border p-2 text-sm font-bold"
            >
              إعادة إلى المسودة
            </button>
          ) : null}

          {["draft", "approved", "scheduled"].includes(status) ? (
            <div className="space-y-2 border-t border-border pt-3">
              <input
                type="datetime-local"
                value={scheduleValue}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                onChange={(event) => onScheduleValue(event.target.value)}
                className="w-full rounded-lg border border-border bg-background p-2 text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                سيتم النشر بتوقيت {timezone}
              </p>
              <button
                type="button"
                disabled={busy || !scheduleValue}
                onClick={() => onAction("schedule")}
                className="w-full rounded-lg border border-border p-2 text-sm font-bold"
              >
                {status === "scheduled" ? "تحديث الجدولة" : "جدولة"}
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          احفظ المسودة أولاً لتفعيل إجراءات سير النشر.
        </p>
      )}
    </section>
  );
}
