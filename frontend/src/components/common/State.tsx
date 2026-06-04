import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "لا توجد بيانات",
  description,
  children,
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
      <Icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground/80" />
      <span dir="ltr" className="mb-1.5 block font-mono text-[10px] tracking-widest text-muted-foreground/50 uppercase select-none">
        [no_data_found]
      </span>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function ErrorState({
  title = "تعذر تحميل البيانات",
  description,
  children,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 font-mono text-sm">
      <div className="flex items-center gap-2 mb-3 text-destructive select-none" dir="ltr">
        <AlertCircle className="h-5 w-5" />
        <span className="font-semibold uppercase tracking-wider text-[11px]">[error_state]</span>
      </div>
      <h3 className="font-bold text-foreground text-base leading-6">{title}</h3>
      {description ? <p className="mt-2 text-sm text-muted-foreground font-sans leading-7">{description}</p> : null}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("min-h-32 animate-pulse rounded-lg border border-border bg-muted/50", className)} />;
}

export function LoadingInline() {
  return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
}
