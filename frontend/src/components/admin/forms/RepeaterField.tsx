"use client";

import React from "react";
import { useFieldArray, Control, FieldValues, ArrayPath, FieldArrayWithId } from "react-hook-form";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { FieldLabel } from "./FieldComponents";
import { cn } from "@/lib/utils";

interface RepeaterFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: ArrayPath<TFieldValues>;
  label: string;
  description?: string;
  addButtonLabel?: string;
  emptyItem: Record<string, unknown>;
  children: (options: {
    field: FieldArrayWithId<TFieldValues, ArrayPath<TFieldValues>>;
    index: number;
    remove: (index: number) => void;
  }) => React.ReactNode;
  className?: string;
}

export function RepeaterField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  addButtonLabel = "إضافة عنصر جديد",
  emptyItem,
  children,
  className,
}: RepeaterFieldProps<TFieldValues>) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name,
  });

  return (
    <div className={cn("space-y-3 w-full", className)} dir="rtl">
      {/* Label and Info */}
      <div className="flex flex-col gap-0.5 border-b border-border/40 pb-2 select-none text-right">
        <FieldLabel label={label} />
        {description && (
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Array fields list */}
      {fields.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-border bg-card/25 rounded-lg text-center select-none text-xs text-muted-foreground">
          لا توجد عناصر مضافة حالياً. انقر على الزر بالأسفل للإضافة.
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="relative flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-border bg-card/45 shadow-sm transition hover:border-primary/20 hover:shadow animate-in slide-in-from-bottom-2 duration-300"
            >
              {/* Index indicator */}
              <div className="flex items-center justify-between border-b border-border/45 pb-2 md:border-b-0 md:pb-0 md:flex-col md:justify-center gap-1.5 shrink-0 select-none">
                <span className="text-[10px] font-black text-muted-foreground/80 bg-muted px-2 py-0.5 rounded-full">
                  العنصر #{index + 1}
                </span>
                
                {/* Immediate Interactive Sorting Arrows */}
                <div className="flex md:flex-col gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    className="h-6 w-6 rounded border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                    title="تحريك لأعلى"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                    className="h-6 w-6 rounded border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                    title="تحريك لأسفل"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Grid content slot */}
              <div className="flex-1 min-w-0">
                {children({ field, index, remove })}
              </div>

              {/* Delete trigger */}
              <div className="flex items-center justify-end md:justify-center shrink-0">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="h-9 w-9 rounded-lg border border-danger/10 bg-danger/5 text-danger hover:bg-danger/10 flex items-center justify-center cursor-pointer transition"
                  title="حذف هذا العنصر"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Append New Item Button */}
      <button
        type="button"
        onClick={() => append(emptyItem as any)}
        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-background/55 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted transition cursor-pointer select-none"
      >
        <Plus className="h-4 w-4" />
        <span>{addButtonLabel}</span>
      </button>
    </div>
  );
}
