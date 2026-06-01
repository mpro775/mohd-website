import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ title = "لا توجد بيانات", description, children }: { title?: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
      <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <h3 className="font-semibold">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      {children}
    </div>
  );
}

export function ErrorState({ title = "تعذر تحميل البيانات", description, children }: { title?: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-100">
      <AlertCircle className="mb-3 h-6 w-6" />
      <h3 className="font-semibold">{title}</h3>
      {description ? <p className="mt-2 text-sm text-red-100/80">{description}</p> : null}
      {children}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("min-h-32 animate-pulse rounded-lg border border-border bg-muted", className)} />;
}

export function LoadingInline() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}
