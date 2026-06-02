"use client";

import React from "react";
import { Inbox, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// --- EmptyState ---
interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = Inbox,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/30 p-8 text-center animate-in fade-in-50 duration-300",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="max-w-xs text-sm text-muted-foreground leading-relaxed mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// --- ErrorState ---
interface ErrorStateProps {
  title?: string;
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "حدث خطأ غير متوقع",
  message,
  retryLabel = "إعادة المحاولة",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-danger/10 bg-danger/5 p-8 text-center animate-in fade-in-50 duration-300",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground leading-relaxed mb-6">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-danger px-4 text-sm font-semibold text-white transition hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 focus:ring-offset-card cursor-pointer"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

// --- LoadingState ---
interface LoadingStateProps {
  label?: string;
  className?: string;
}

export function LoadingState({
  label = "جاري تحميل البيانات...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <Loader2 className="absolute h-5 w-5 text-primary animate-pulse" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {label}
      </p>
    </div>
  );
}
