"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  InputField,
  TextAreaField,
  SelectField,
  SwitchField,
} from "@/components/admin/forms/FieldComponents";
import { FormSection } from "@/components/admin/forms/FormSection";
import { SeoFieldsCard } from "@/components/admin/forms/SeoFieldsCard";
import type { FaqFormValues } from "./schema";

interface FaqFormProps {
  form: UseFormReturn<FaqFormValues>;
  onSubmit?: any;
}

export function FaqForm({ form }: FaqFormProps) {
  const { register, control, formState: { errors } } = form;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. FAQ Info */}
      <FormSection title="تفاصيل السؤال الشائع" description="صغ السؤال وإجابته بشكل واضح ودقيق ليساعد عملائك." columns={2}>
        <div className="md:col-span-2">
          <InputField
            label="السؤال المطروح"
            placeholder="مثال: ما هي المدة المستغرقة لتسليم التصاميم النهائية؟"
            required
            register={register("question")}
            error={errors.question?.message}
          />
        </div>

        <div className="md:col-span-2">
          <TextAreaField
            label="الإجابة الكاملة"
            placeholder="اكتب الإجابة المفصلة لتوضيح السؤال، وأي شروط أو ملاحظات..."
            required
            register={register("answer")}
            error={errors.answer?.message}
            rows={5}
          />
        </div>

        <div className="md:col-span-2">
          <SelectField
            label="التصنيف (Category)"
            options={[
              { label: "عام (general)", value: "general" },
              { label: "تقني وبرمجي (technical)", value: "technical" },
              { label: "التسعير والاشتراك (pricing)", value: "pricing" },
              { label: "الضمان والتعاقد (security)", value: "security" },
              { label: "أخرى (other)", value: "other" },
            ]}
            register={register("category")}
            error={errors.category?.message}
          />
        </div>
      </FormSection>

      {/* 2. Options */}
      <FormSection title="خيارات النشر والمكان" columns={2}>
        <SwitchField
          label="منشور ومرئي للزوار"
          description="تفعيل هذا يجعل السؤال يظهر في صفحة المساعدة أو الأسئلة الشائعة."
          register={register("isPublished")}
          error={errors.isPublished?.message}
        />

        <SwitchField
          label="تثبيت وتمييز في الصفحة الرئيسية"
          description="تفعيل هذا يدرج السؤال في قسم الاستعلامات السريع بالرئيسية."
          register={register("isFeatured")}
          error={errors.isFeatured?.message}
        />
      </FormSection>

      {/* 3. SEO Card */}
      <SeoFieldsCard
        register={register as any}
        control={control as any}
        errors={errors as any}
        defaultFolder="faqs"
      />
    </div>
  );
}
