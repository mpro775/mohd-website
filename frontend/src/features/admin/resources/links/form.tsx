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
import type { LinkFormValues } from "./schema";

import { useAdminOptions } from "../../hooks/use-options";

interface LinkFormProps {
  form: UseFormReturn<LinkFormValues, any, any>;
  onSubmit?: any;
}

export function LinkForm({ form }: LinkFormProps) {
  const { register, control, watch, formState: { errors } } = form;
  const { data: optionsData } = useAdminOptions();

  const categoryOptions = (optionsData?.linkCategories || []).map((c) => ({
    label: c.labelAr,
    value: c.value,
  }));

  const platformOptions = (optionsData?.linkPlatforms || []).map((p) => ({
    label: p.labelAr,
    value: p.value,
  }));

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Basic Info */}
      <FormSection title="المعلومات الأساسية للرابط" description="عنوان الرابط، والوجهة النهائية، ووصف مبسط للتعريف به." columns={2}>
        <div className="md:col-span-2">
          <InputField
            label="اسم الرابط / العنوان العربي"
            placeholder="مثال: حسابي على لينكد إن، أو مستودع الكود المصدري..."
            required
            register={register("title")}
            error={errors.title?.message}
          />
        </div>

        <div className="md:col-span-2">
          <InputField
            label="رابط الوجهة الكامل URL"
            type="url"
            placeholder="https://..."
            required
            register={register("url")}
            error={errors.url?.message}
          />
        </div>

        <InputField
          label="الرابط الفريد (Slug)"
          placeholder="اتركه فارغاً للتوليد التلقائي"
          register={register("slug")}
          error={errors.slug?.message}
        />

        <SelectField
          label="تصنيف الرابط (Category)"
          options={[
            { label: "جاري التحميل...", value: "" },
            ...categoryOptions,
          ]}
          register={register("category")}
          error={errors.category?.message}
        />

        <div className="md:col-span-2">
          <TextAreaField
            label="وصف مبسط للرابط"
            placeholder="توضيح مختصر يعرّف الزوار بوجهة هذا الرابط ومحتواه..."
            register={register("description")}
            error={errors.description?.message}
            rows={3}
          />
        </div>
      </FormSection>

      {/* 2. Platform Branding */}
      <FormSection title="هوية المنصة وشعارها" description="اختر أيقونة وشعار المنصة لتسهيل التعرف عليها بصرياً." columns={2}>
        <SelectField
          label="المنصة (Platform)"
          options={[
            { label: "جاري التحميل...", value: "" },
            ...platformOptions,
          ]}
          register={register("platform")}
          error={errors.platform?.message}
        />

        <div className="md:col-span-2">
          <Controller
            control={control}
            name="iconMediaId"
            render={({ field }) => (
              <MediaField
                label="أيقونة أو شعار مخصص للرابط"
                valueId={field.value}
                valueUrl={watch("icon" as any)}
                onChange={field.onChange}
                error={errors.iconMediaId?.message}
                allowedType="image"
                defaultFolder="links"
              />
            )}
          />
        </div>
      </FormSection>

      {/* 3. Navigation Options */}
      <FormSection title="خيارات التوجيه والنشر" columns={2}>
        <SwitchField
          label="فتح الرابط في علامة تبويب جديدة (Blank)"
          description="تفعيل هذا يجعل الرابط يفتح في صفحة جديدة دون إغلاق موقعك الحالي."
          register={register("openInNewTab")}
          error={errors.openInNewTab?.message}
        />

        <SwitchField
          label="نشط ومتاح للعامة"
          description="تفعيل هذا يعرض الرابط في قائمة الروابط للزوار."
          register={register("isPublished")}
          error={errors.isPublished?.message}
        />

        <div className="md:col-span-2">
          <SwitchField
            label="تمييز الرابط وتثبيته في البداية"
            description="يبرز هذا الرابط ويعطيه طابعاً مميزاً لجذب انتباه الزوار."
            register={register("isFeatured")}
            error={errors.isFeatured?.message}
          />
        </div>
      </FormSection>
    </div>
  );
}
