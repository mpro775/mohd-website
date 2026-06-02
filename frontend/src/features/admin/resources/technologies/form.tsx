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

interface TechnologyFormProps {
  form: UseFormReturn<TechnologyFormValues>;
  onSubmit?: any;
}

export function TechnologyForm({ form }: TechnologyFormProps) {
  const { register, control, watch, formState: { errors } } = form;
  const selectedColor = watch("color") || "#4f46e5";

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
            { label: "تطوير الواجهات الأمامية (frontend)", value: "frontend" },
            { label: "تطوير الأنظمة الخلفية (backend)", value: "backend" },
            { label: "قواعد البيانات (database)", value: "database" },
            { label: "البنية التحتية والسحابية (devops)", value: "devops" },
            { label: "أدوات التطوير (tools)", value: "tools" },
            { label: "تصميم واجهات المستخدم (design)", value: "design" },
            { label: "تطوير تطبيقات الهواتف (mobile)", value: "mobile" },
            { label: "أخرى (other)", value: "other" },
          ]}
          required
          register={register("category")}
          error={errors.category?.message}
        />

        <InputField
          label="المجموعة الفرعية (Group)"
          placeholder="مثال: Frameworks, Languages, UI Libraries"
          register={register("group")}
          error={errors.group?.message}
        />

        <SelectField
          label="مستوى الخبرة / Proficiency Level"
          options={[
            { label: "مبتدئ (Beginner)", value: "beginner" },
            { label: "متوسط (Intermediate)", value: "intermediate" },
            { label: "متقدم (Advanced)", value: "advanced" },
            { label: "خبير (Expert)", value: "expert" },
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
            name="icon"
            render={({ field }) => (
              <MediaField
                label="شعار التقنية (Logo)"
                value={field.value || undefined}
                onChange={field.onChange}
                error={errors.icon?.message}
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
