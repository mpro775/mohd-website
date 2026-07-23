"use client";

export function PostBulkActionsBar({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  if (!count) return null;
  return (
    <div className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-card/95 p-3 shadow-xl backdrop-blur">
      <p className="text-sm font-bold">تم تحديد {count.toLocaleString("ar-SA")} مقالات</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
