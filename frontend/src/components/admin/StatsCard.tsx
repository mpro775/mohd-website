"use client";

import React from "react";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  change?: {
    value: string | number;
    type: "increase" | "decrease";
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  change,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 group",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground/80">
          {title}
        </p>
        {Icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold tracking-tight text-foreground" dir="ltr">
          {value}
        </h3>
        {(change || description) && (
          <div className="mt-2 flex items-center gap-2">
            {change && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                  change.type === "increase"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500"
                )}
                dir="ltr"
              >
                {change.type === "increase" ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                {change.value}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground truncate">
                {description}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 right-0 h-1 w-0 bg-primary/40 transition-all duration-500 group-hover:w-full" />
    </div>
  );
}
