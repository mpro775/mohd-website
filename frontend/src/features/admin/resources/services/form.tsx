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
import { SeoFieldsCard } from "@/components/admin/forms/SeoFieldsCard";
import { FormSection } from "@/components/admin/forms/FormSection";
import { RepeaterField } from "@/components/admin/forms/RepeaterField";
import type { ServiceFormValues } from "./schema";
import { useAdminOptions } from "../../hooks/use-options";

interface ServiceFormProps {
  form: UseFormReturn<ServiceFormValues>;
  onSubmit?: any;
}

export function ServiceForm({ form }: ServiceFormProps) {
  const { register, control, watch, formState: { errors } } = form;
  const { data: optionsData } = useAdminOptions();

  const categoryOptions = (optionsData?.serviceCategories || []).map((c) => ({
    label: c.labelAr,
    value: c.value,
  }));

  const currencyOptions = (optionsData?.currencies || []).map((cur) => ({
    label: cur.label,
    value: cur.value,
  }));

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Basic Info */}
      <FormSection title="البيانات الأساسية للخدمة" description="اسم الخدمة، رابطها، ووصفها المبسط للعملاء." columns={2}>
        <div className="md:col-span-2">
          <InputField
            label="اسم الخدمة"
            placeholder="مثال: تطوير وتصميم هوية بصرية متكاملة..."
            required
            register={register("name")}
            error={errors.name?.message}
          />
        </div>

        <InputField
          label="الرابط الفريد (Slug)"
          placeholder="اتركه فارغاً للتوليد التلقائي"
          register={register("slug")}
          error={errors.slug?.message}
        />

        <InputField
          label="مدة التسليم المتوقعة"
          placeholder="مثال: 5 أيام عمل، أسبوعين"
          register={register("duration")}
          error={errors.duration?.message}
        />

        <div className="md:col-span-2">
          <SelectField
            label="تصنيف الخدمة"
            required
            options={[
              { label: "جاري التحميل...", value: "" },
              ...categoryOptions,
            ]}
            register={register("category")}
            error={errors.category?.message}
          />
        </div>

        <div className="md:col-span-2">
          <TextAreaField
            label="وصف الخدمة القصير"
            placeholder="اكتب خلاصة سريعة ومقنعة لجذب العميل لطلب الخدمة..."
            required
            register={register("shortDescription")}
            error={errors.shortDescription?.message}
            rows={3}
          />
        </div>

        <div className="md:col-span-2">
          <TextAreaField
            label="تفاصيل الخدمة الكاملة"
            placeholder="اكتب تفاصيل إضافية حول الخدمة، آليتك في البناء، وكيف تخدم العميل..."
            register={register("detailedDescription")}
            error={errors.detailedDescription?.message}
            rows={5}
          />
        </div>
      </FormSection>

      {/* 2. Pricing & CTA */}
      <FormSection title="التسعير وإجراءات الطلب" description="بيانات الأسعار ورابط طلب الخدمة المباشر." columns={2}>
        <InputField
          label="السعر المبدئي الرقمي"
          type="number"
          placeholder="مثال: 150"
          register={register("startingPrice", { valueAsNumber: true })}
          error={errors.startingPrice?.message}
        />

        <SelectField
          label="العملة"
          options={[
            { label: "جاري التحميل...", value: "" },
            ...currencyOptions,
          ]}
          register={register("currency")}
          error={errors.currency?.message}
        />

        <InputField
          label="عرض السعر النصي البديل"
          placeholder="مثال: يبدأ من $150، سعر مخصص"
          register={register("price")}
          error={errors.price?.message}
        />

        <InputField
          label="نص زر الطلب (CTA Button Text)"
          placeholder="مثال: اطلب الخدمة الآن"
          register={register("ctaText")}
          error={errors.ctaText?.message}
        />

        <div className="md:col-span-2">
          <InputField
            label="رابط زر الطلب (CTA Button URL)"
            type="url"
            placeholder="https://..."
            register={register("ctaUrl")}
            error={errors.ctaUrl?.message}
          />
        </div>
      </FormSection>

      {/* 3. Deliverables and Requirements */}
      <FormSection title="مخرجات الخدمة ومتطلبات العميل" description="أضف مخرجات العمل الفردية والطلبات اللازمة من العميل للبدء.">
        
        {/* Deliverables Repeater */}
        <RepeaterField
          control={control as any}
          name="deliverables"
          label="مخرجات الخدمة ومسلمات العمل"
          description="أضف البنود التي سيتسلمها العميل بعد انتهاء العمل."
          addButtonLabel="إضافة مخرج جديد"
          emptyItem={{ value: "" }}
        >
          {({ index }) => (
            <div className="flex-1 text-right">
              <InputField
                label="بند التسليم"
                register={register(`deliverables.${index}.value` as any)}
                placeholder="مثال: ملفات الشعار المصدرية بجودة عالية Vector"
                required
              />
            </div>
          )}
        </RepeaterField>

        <div className="border-t border-border/40 my-5" />

        {/* Requirements Repeater */}
        <RepeaterField
          control={control as any}
          name="requirements"
          label="متطلبات البدء من العميل"
          description="أضف الأسئلة أو الملفات المطلوبة من العميل للبدء فوراً."
          addButtonLabel="إضافة متطلب جديد"
          emptyItem={{ value: "" }}
        >
          {({ index }) => (
            <div className="flex-1 text-right">
              <InputField
                label="المستند / المعلومة المطلوبة"
                register={register(`requirements.${index}.value` as any)}
                placeholder="مثال: دليل الألوان المفضل أو نماذج تعجبك"
                required
              />
            </div>
          )}
        </RepeaterField>
      </FormSection>

      {/* 4. Media & Toggles */}
      <FormSection title="شعار الخدمة والخيارات العامة" columns={2}>
        <div className="md:col-span-2">
          <Controller
            control={control}
            name="iconMediaId"
            render={({ field }) => (
              <MediaField
                label="أيقونة الخدمة / الشعار"
                valueId={field.value}
                valueUrl={watch("icon" as any)}
                onChange={field.onChange}
                error={errors.iconMediaId?.message}
                allowedType="image"
                defaultFolder="services"
              />
            )}
          />
        </div>

        <SwitchField
          label="منشورة ومتاحة للعرض للزوار"
          description="تفعيل هذا الخيار يعرض الخدمة للعامة في الموقع."
          register={register("isPublished")}
          error={errors.isPublished?.message}
        />

        <SwitchField
          label="تمييز الخدمة وتثبيتها بالرئيسية"
          description="تفعيل هذا الخيار يبرز الخدمة في الصفحة الرئيسية للموقع."
          register={register("isFeatured")}
          error={errors.isFeatured?.message}
        />
      </FormSection>

      {/* 5. SEO Card */}
      <SeoFieldsCard
        register={register as any}
        control={control as any}
        errors={errors as any}
        defaultFolder="services"
      />
    </div>
  );
}
