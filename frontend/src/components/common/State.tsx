import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title = "لا توجد بيانات بعد",
  description = "سيظهر المحتوى هنا بمجرد توفره.",
  children,
  icon: Icon = Inbox,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="premium-card p-8 text-center">
      <Icon className="mx-auto mb-3 h-9 w-9 text-primary/80" />
      <span dir="ltr" className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
        [empty_state]
      </span>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "تعذر تحميل البيانات",
  description = "حدث خلل مؤقت. حاول تحديث الصفحة أو العودة لاحقًا.",
  children,
}: {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-sm">
      <div className="mb-3 flex items-center gap-2 text-destructive" dir="ltr">
        <AlertCircle className="h-5 w-5" />
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider">[error_state]</span>
      </div>
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      <p className="mt-2 leading-7 text-muted-foreground">{description}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return <div className={cn("min-h-32 animate-pulse rounded-lg border border-border bg-muted/50", className)} />;
}

export function LoadingInline() {
  return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
}
