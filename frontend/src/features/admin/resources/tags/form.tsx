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
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Tag Form Fields */}
      <FormSection title="بيانات وسم المدونة" description="اسم الوسم لتصنيف مقالاتك." columns={1}>
        <InputField
          label="اسم الوسم"
          placeholder="مثال: ذكاء اصطناعي، أو نصائح برمجة..."
          required
          register={register("name")}
          error={errors.name?.message}
        />
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
