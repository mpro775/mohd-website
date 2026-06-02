"use client";

import React from "react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-5 mb-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3 md:mt-0">
          {children}
        </div>
      )}
    </div>
  );
}
