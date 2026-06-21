"use client";

import React from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import {
  InputField,
  TextAreaField,
  SelectField,
  SwitchField,
} from "@/components/admin/forms/FieldComponents";
import { MediaField } from "@/components/admin/forms/MediaField";
import { FormSection } from "@/components/admin/forms/FormSection";
import type { TechnologyFormValues } from "./schema";
import { useAdminOptions } from "../../hooks/use-options";

interface TechnologyFormProps {
  form: UseFormReturn<TechnologyFormValues>;
  onSubmit?: any;
}

export function TechnologyForm({ form }: TechnologyFormProps) {
  const { register, control, watch, formState: { errors } } = form;
  const selectedColor = watch("color") || "#4f46e5";
  const { data: optionsData } = useAdminOptions();

  const categoryOptions = (optionsData?.technologyCategories || []).map((c) => ({
    label: c.labelAr,
    value: c.value,
  }));

  const groupOptions = (optionsData?.technologyGroups || []).map((g) => ({
    label: g.labelAr,
    value: g.value,
  }));

  const proficiencyOptions = (optionsData?.proficiencyLevels || []).map((p) => ({
    label: p.labelAr,
    value: p.value,
  }));

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Basic Info */}
      <FormSection title="المعلومات الأساسية للتقنية" description="اسم التقنية وتصنيفها والوصف العام لاستخدامك لها." columns={2}>
        <div className="md:col-span-2">
          <InputField
            label="اسم التقنية"
            placeholder="مثال: React, NestJS, Tailwind CSS"
            required
            register={register("name")}
            error={errors.name?.message}
          />
        </div>

        <InputField
          label="الرابط الفريد (Slug)"
          placeholder="مثال: reactjs"
          register={register("slug")}
          error={errors.slug?.message}
        />

        <SelectField
          label="المجموعة الرئيسية (Category)"
          options={[
            { label: "جاري التحميل...", value: "" },
            ...categoryOptions,
          ]}
          required
          register={register("category")}
          error={errors.category?.message}
        />

        <SelectField
          label="المجموعة الفرعية (Group)"
          options={[
            { label: "جاري التحميل...", value: "" },
            ...groupOptions,
          ]}
          register={register("group")}
          error={errors.group?.message}
        />

        <SelectField
          label="مستوى الخبرة / Proficiency Level"
          options={[
            { label: "جاري التحميل...", value: "" },
            ...proficiencyOptions,
          ]}
          required
          register={register("proficiencyLevel")}
          error={errors.proficiencyLevel?.message}
        />

        <div className="md:col-span-2">
          <InputField
            label="سنوات الخبرة العملية"
            type="number"
            placeholder="مثال: 4"
            register={register("yearsOfExperience", { valueAsNumber: true })}
            error={errors.yearsOfExperience?.message}
          />
        </div>

        <div className="md:col-span-2">
          <TextAreaField
            label="وصف التقنية أو استخدامها"
            placeholder="اكتب نبذة مختصرة عن دور التقنية في مشاريعك وخبرتك بها..."
            register={register("description")}
            error={errors.description?.message}
            rows={3}
          />
        </div>
      </FormSection>

      {/* 2. Aesthetics & Branding */}
      <FormSection title="الهوية البصرية والروابط" description="الألوان والشعارات والروابط الرسمية للتقنية." columns={2}>
        <div className="md:col-span-2 flex items-end gap-3">
          <div className="flex-1">
            <InputField
              label="اللون التعريفي (Color Hex)"
              placeholder="مثال: #61dafb"
              register={register("color")}
              error={errors.color?.message}
            />
          </div>
          <div
            className="h-10 w-10 rounded-lg border border-border shadow-sm transition"
            style={{ backgroundColor: selectedColor }}
            title="معاينة اللون"
          />
        </div>

        <div className="md:col-span-2">
          <InputField
            label="الرابط الرسمي للتقنية"
            type="url"
            placeholder="https://react.dev"
            register={register("officialUrl")}
            error={errors.officialUrl?.message}
          />
        </div>

        <div className="md:col-span-2">
          <Controller
            control={control}
            name="iconMediaId"
            render={({ field }) => (
              <MediaField
                label="شعار التقنية (Logo)"
                valueId={field.value}
                valueUrl={watch("icon" as any)}
                onChange={field.onChange}
                error={errors.iconMediaId?.message}
                allowedType="image"
                defaultFolder="technologies"
              />
            )}
          />
        </div>
      </FormSection>

      {/* 3. Toggles */}
      <FormSection title="حالة النشر والظهور" columns={2}>
        <SwitchField
          label="نشطة وتظهر للزوار"
          description="تفعيل هذا يعرض التقنية في لوحة المهارات والخبرات."
          register={register("isPublished")}
          error={errors.isPublished?.message}
        />

        <SwitchField
          label="تثبيت وتمييز التقنية بالرئيسية"
          description="تفعيل هذا يعرضها في شريط التقنيات الرئيسي بالصفحة الأولى."
          register={register("highlighted")}
          error={errors.highlighted?.message}
        />
      </FormSection>
    </div>
  );
}
