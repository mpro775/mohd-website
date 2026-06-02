"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  InputField,
  TextAreaField,
  SwitchField,
} from "@/components/admin/forms/FieldComponents";
import { FormSection } from "@/components/admin/forms/FormSection";
import type { CategoryFormValues } from "./schema";

interface CategoryFormProps {
  form: UseFormReturn<CategoryFormValues>;
  onSubmit?: any;
}

export function CategoryForm({ form }: CategoryFormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Category Form Fields */}
      <FormSection title="بيانات تصنيف المدونة" description="اسم التصنيف، رابطه الفريد، والوصف العام لتنظيم مقالاتك." columns={2}>
        <div className="md:col-span-2">
          <InputField
            label="اسم التصنيف"
            placeholder="مثال: تجارب ومقالات تقنية، أو ريادة الأعمال..."
            required
            register={register("name")}
            error={errors.name?.message}
          />
        </div>

        <div className="md:col-span-2">
          <InputField
            label="الرابط الفريد (Slug)"
            placeholder="مثال: tech-articles"
            register={register("slug")}
            error={errors.slug?.message}
          />
        </div>

        <div className="md:col-span-2">
          <TextAreaField
            label="وصف التصنيف"
            placeholder="اكتب لمحة بسيطة تعرّف المقالات التي تندرج تحت هذا التصنيف..."
            register={register("description")}
            error={errors.description?.message}
            rows={4}
          />
        </div>
      </FormSection>

      {/* 2. Options */}
      <FormSection title="الحالة والظهور" columns={1}>
        <SwitchField
          label="نشط ومتاح للاستخدام"
          description="تفعيل هذا يجعل التصنيف نشطاً ومتاحاً لربطه بالمقالات الحالية والجديدة."
          register={register("isActive")}
          error={errors.isActive?.message}
        />
      </FormSection>
    </div>
  );
}
