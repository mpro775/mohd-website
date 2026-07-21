"use client";

import React, { useState } from "react";
import { FileText, Upload, Trash2 } from "lucide-react";
import { MediaPicker } from "../MediaPicker";
import { FieldLabel, FieldError } from "./FieldComponents";
import { cn } from "@/lib/utils";

interface MediaFieldProps {
  label: string;
  valueId?: string | null;
  valueUrl?: string | null;
  value?: string | null; // fallback
  onChange: (id: string | null) => void;
  error?: string;
  required?: boolean;
  allowedType?: "image" | "document" | "all";
  defaultFolder?: string;
  className?: string;
}

export function MediaField({
  label,
  valueId,
  valueUrl,
  value,
  onChange,
  error,
  required,
  allowedType = "all",
  defaultFolder = "misc",
  className,
}: MediaFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [localSelection, setLocalSelection] = useState<{ id: string; url: string; name: string } | null>(null);
  const displayUrl = valueId && localSelection?.id === valueId
    ? localSelection.url
    : valueUrl || (value && value.startsWith("http") ? value : null);

  const isImage = displayUrl && (
    displayUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || 
    displayUrl.includes("/misc") || 
    displayUrl.includes("/projects") || 
    displayUrl.includes("/blog") || 
    displayUrl.includes("/profile") ||
    displayUrl.includes("/services") ||
    displayUrl.includes("/technologies") ||
    displayUrl.includes("/certifications") ||
    displayUrl.includes("/education")
  );

  return (
    <div className={cn("space-y-1.5 w-full", className)} dir="rtl">
      <FieldLabel label={label} required={required} />

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/35 p-3">
        {displayUrl ? (
          // Selected Media Preview Frame
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-2.5 rounded-lg border border-border bg-card/65 select-none animate-in fade-in duration-300">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-14 w-14 rounded-md border border-border overflow-hidden bg-muted/40 flex items-center justify-center shrink-0">
                {isImage ? (
                  <img src={displayUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[11px] font-bold text-foreground truncate" dir="ltr">
                  {(valueId && localSelection?.id === valueId ? localSelection.name : null) || displayUrl.split("/").pop() || "ملف محدد"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5" dir="ltr">
                  {displayUrl}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end sm:mt-0">
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none"
              >
                <span>تغيير</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLocalSelection(null);
                  onChange(null);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-danger/10 bg-danger/5 text-danger hover:bg-danger/10 cursor-pointer transition select-none"
                title="إزالة الملف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          // Empty Select Trigger Button
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="flex min-h-[100px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/45 p-4 text-center transition hover:border-primary/50 hover:bg-background/80 cursor-pointer select-none"
          >
            <Upload className="h-6 w-6 text-muted-foreground mb-2 animate-pulse" />
            <span className="text-xs font-bold text-primary">اختر ملفاً أو صورة</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">من مكتبة الوسائط</span>
          </button>
        )}
      </div>

      <FieldError error={error} />

      {/* Media Library Picker Modal */}
      <MediaPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(item) => {
          const id = item._id || item.id || "";
          setLocalSelection({ id, url: item.url, name: item.originalName || item.filename });
          onChange(id);
          setIsPickerOpen(false);
        }}
        allowedType={allowedType}
        defaultFolder={defaultFolder}
      />
    </div>
  );
}
