"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  InputField,
  SwitchField,
} from "@/components/admin/forms/FieldComponents";
import { FormSection } from "@/components/admin/forms/FormSection";
import type { TagFormValues } from "./schema";

interface TagFormProps {
  form: UseFormReturn<TagFormValues>;
  onSubmit?: any;
}

export function TagForm({ form }: TagFormProps) {
  const { register, watch, formState: { errors } } = form;
  const selectedColor = watch("color") || "#3b82f6";

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Tag Form Fields */}
      <FormSection title="بيانات وسم المدونة" description="اسم الوسم، رابطه الفريد، ولونه التعريفي لتصنيف مقالاتك بشكل مرئي وجذاب." columns={2}>
        <div className="md:col-span-2">
          <InputField
            label="اسم الوسم"
            placeholder="مثال: ذكاء اصطناعي، أو نصائح برمجة..."
            required
            register={register("name")}
            error={errors.name?.message}
          />
        </div>

        <div className="md:col-span-2">
          <InputField
            label="الرابط الفريد (Slug)"
            placeholder="مثال: ai-tips"
            register={register("slug")}
            error={errors.slug?.message}
          />
        </div>

        <div className="md:col-span-2 flex items-end gap-3">
          <div className="flex-1">
            <InputField
              label="اللون التعريفي للوسم (Color Hex)"
              placeholder="مثال: #3b82f6"
              register={register("color")}
              error={errors.color?.message}
            />
          </div>
          <div
            className="h-10 w-10 rounded-lg border border-border shadow-sm transition shrink-0"
            style={{ backgroundColor: selectedColor }}
            title="معاينة اللون"
          />
        </div>
      </FormSection>

      {/* 2. Options */}
      <FormSection title="الحالة والظهور" columns={1}>
        <SwitchField
          label="نشط ومتاح للاستخدام"
          description="تفعيل هذا يجعل الوسم نشطاً ومتاحاً لربطه بالمقالات."
          register={register("isActive")}
          error={errors.isActive?.message}
        />
      </FormSection>
    </div>
  );
}
