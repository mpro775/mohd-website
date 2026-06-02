"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  columns = 1,
  className,
}: FormSectionProps) {
  const getGridColumns = () => {
    switch (columns) {
      case 3:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      default:
        return "grid-cols-1";
    }
  };

  return (
    <div className={cn("space-y-4 rounded-xl border border-border bg-card/40 p-5 shadow-sm", className)}>
      <div className="space-y-1 select-none border-b border-border/40 pb-3">
        <h4 className="text-sm font-black text-foreground">
          {title}
        </h4>
        {description && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className={cn("grid gap-4", getGridColumns())}>
        {children}
      </div>
    </div>
  );
}
