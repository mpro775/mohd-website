"use client";

import React, { useState } from "react";
import { Control, UseFormRegister, FieldErrors, Controller, Path } from "react-hook-form";
import { ChevronDown, ChevronUp, Globe } from "lucide-react";
import { InputField, TextAreaField } from "./FieldComponents";
import { MediaField } from "./MediaField";
import { cn } from "@/lib/utils";

import { useWatch } from "react-hook-form";

export interface HasSeoFields {
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: string | null;
    ogImageMediaId?: string | null;
  };
}

interface SeoFieldsCardProps<TFieldValues extends HasSeoFields> {
  register: UseFormRegister<TFieldValues>;
  control: Control<TFieldValues, any, any>;
  errors: FieldErrors<TFieldValues>;
  defaultFolder?: string;
  className?: string;
}

export function SeoFieldsCard<TFieldValues extends HasSeoFields>({
  register,
  control,
  errors,
  defaultFolder = "misc",
  className,
}: SeoFieldsCardProps<TFieldValues>) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Access nested fields safely
  const seoErrors = errors.seo as Record<string, { message?: string }> | undefined;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/45 shadow-sm transition-all duration-300",
        isExpanded ? "border-primary/20" : "border-border hover:border-muted-foreground/30",
        className
      )}
      dir="rtl"
    >
      {/* Accordion header button */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 select-none cursor-pointer outline-none focus:ring-1 focus:ring-primary rounded-xl"
      >
        <div className="flex items-center gap-3 text-right">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Globe className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-foreground">تحسين محركات البحث (SEO)</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">تهيئة الكلمات المفتاحية والعناوين والأرشفة العامة</p>
          </div>
        </div>

        <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Accordion expandable panel */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-3 border-t border-border/40 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <InputField
            label="عنوان الميتا (Meta Title)"
            placeholder="اتركه فارغاً للاعتماد على العنوان الافتراضي"
            register={register("seo.metaTitle" as Path<TFieldValues>)}
            error={seoErrors?.metaTitle?.message}
          />

          <TextAreaField
            label="وصف الميتا (Meta Description)"
            placeholder="اتركه فارغاً للاعتماد على الوصف الافتراضي"
            register={register("seo.metaDescription" as Path<TFieldValues>)}
            error={seoErrors?.metaDescription?.message}
            rows={3}
          />

          {/* ogImage controller binding */}
          {(() => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const ogImageUrl = useWatch({
              control,
              name: "seo.ogImage" as Path<TFieldValues>,
            }) as string | undefined;

            return (
              <Controller
                control={control}
                name={"seo.ogImageMediaId" as Path<TFieldValues>}
                render={({ field }) => (
                  <MediaField
                    label="صورة المشاركة (og:image)"
                    valueId={field.value as string | undefined}
                    valueUrl={ogImageUrl}
                    onChange={field.onChange}
                    error={seoErrors?.ogImageMediaId?.message}
                    allowedType="image"
                    defaultFolder={defaultFolder}
                  />
                )}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}
