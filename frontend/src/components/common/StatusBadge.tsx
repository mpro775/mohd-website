const labels: Record<string, string> = {
  published: "منشور",
  draft: "مسودة",
  scheduled: "مجدول",
  archived: "مؤرشف",
  completed: "مكتمل",
  "in-progress": "قيد التنفيذ",
  paused: "متوقف",
  true: "مفعل",
  false: "معطل",
};

export function StatusBadge({ value }: { value?: string | boolean }) {
  const key = String(value ?? "");
  return (
    <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
      {labels[key] ?? key}
    </span>
  );
}
