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
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
  expert: "خبير",
};

const styles: Record<string, string> = {
  published: "border-primary/25 bg-primary/5 text-primary",
  completed: "border-primary/25 bg-primary/5 text-primary",
  true: "border-primary/25 bg-primary/5 text-primary",
  advanced: "border-primary/25 bg-primary/5 text-primary",
  expert: "border-primary bg-primary/10 text-primary font-semibold",
  draft: "border-border bg-muted/60 text-muted-foreground",
  archived: "border-border bg-muted/60 text-muted-foreground",
  paused: "border-border bg-muted/60 text-muted-foreground",
  beginner: "border-border bg-muted/60 text-muted-foreground",
  scheduled: "border-warning/25 bg-warning/5 text-warning",
  "in-progress": "border-secondary/25 bg-secondary/5 text-secondary",
  intermediate: "border-secondary/25 bg-secondary/5 text-secondary",
  false: "border-destructive/25 bg-destructive/5 text-destructive",
};

export function StatusBadge({ value }: { value?: string | boolean }) {
  const key = String(value ?? "");
  const styleClass = styles[key] ?? "border-border bg-muted/60 text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styleClass}`}>
      {labels[key] ?? key}
    </span>
  );
}
