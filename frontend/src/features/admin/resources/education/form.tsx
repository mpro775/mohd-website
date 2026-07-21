"use client";

import { useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { FormSection } from "@/components/admin/forms/FormSection";
import { InputField, SelectField, SwitchField, TextAreaField } from "@/components/admin/forms/FieldComponents";
import { MediaField } from "@/components/admin/forms/MediaField";
import { SeoFieldsCard } from "@/components/admin/forms/SeoFieldsCard";
import { TagInput } from "@/components/admin/forms/TagInput";
import { useAdminOptions } from "../../hooks/use-options";
import type { EducationFormValues } from "./schema";

export function EducationForm({ form }: { form: UseFormReturn<EducationFormValues> }) {
  const { register, control, watch, setValue, formState: { errors } } = form;
  const isCurrent = watch("isCurrent");
  const { data: options } = useAdminOptions();

  useEffect(() => {
    if (isCurrent) setValue("endDate", "", { shouldValidate: true });
  }, [isCurrent, setValue]);

  const degreeOptions = (options?.educationDegreeTypes ?? []).map((item) => ({
    value: item.value,
    label: item.labelAr || item.label || item.labelEn,
  }));

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <FormSection title="البيانات الأساسية" columns={2}>
        <InputField label="المؤسسة" required register={register("institution")} error={errors.institution?.message} />
        <InputField label="الرابط الفريد (Slug)" dir="ltr" register={register("slug")} error={errors.slug?.message} />
        <InputField label="اسم الدرجة" required register={register("degree")} error={errors.degree?.message} />
        <SelectField label="نوع الدرجة" required register={register("degreeType")} error={errors.degreeType?.message} options={degreeOptions.length ? degreeOptions : [{ value: "other", label: "أخرى" }]} />
        <InputField label="التخصص" register={register("fieldOfStudy")} error={errors.fieldOfStudy?.message} />
        <InputField label="الموقع" register={register("location")} error={errors.location?.message} />
        <div className="md:col-span-2"><InputField label="رابط المؤسسة" type="url" dir="ltr" register={register("institutionUrl")} error={errors.institutionUrl?.message} /></div>
      </FormSection>

      <FormSection title="الفترة الأكاديمية" columns={2}>
        <InputField label="تاريخ البداية" type="date" dir="ltr" register={register("startDate")} error={errors.startDate?.message} />
        <SwitchField label="أدرس حاليًا" description="يمسح تاريخ النهاية عند التفعيل." register={register("isCurrent")} error={errors.isCurrent?.message} />
        {!isCurrent ? <InputField label="تاريخ النهاية" type="date" dir="ltr" register={register("endDate")} error={errors.endDate?.message} /> : null}
        <InputField label="التقدير / المعدل" register={register("grade")} error={errors.grade?.message} />
      </FormSection>

      <FormSection title="الوصف والإنجازات" columns={1}>
        <TextAreaField label="الوصف" rows={7} register={register("description")} error={errors.description?.message} />
        <Controller control={control} name="achievements" render={({ field }) => <TagInput label="الإنجازات" value={field.value} onChange={field.onChange} error={errors.achievements?.message} maxLength={180} />} />
      </FormSection>

      <FormSection title="الوسائط" columns={2}>
        <Controller control={control} name="institutionLogoMediaId" render={({ field }) => <MediaField label="شعار المؤسسة" valueId={field.value} valueUrl={watch("institutionLogo")} onChange={field.onChange} error={errors.institutionLogoMediaId?.message} allowedType="image" defaultFolder="education" />} />
        <Controller control={control} name="coverImageMediaId" render={({ field }) => <MediaField label="صورة الغلاف" valueId={field.value} valueUrl={watch("coverImage")} onChange={field.onChange} error={errors.coverImageMediaId?.message} allowedType="image" defaultFolder="education" />} />
        <Controller control={control} name="certificateMediaId" render={({ field }) => <MediaField label="ملف المؤهل PDF" valueId={field.value} valueUrl={watch("certificate")} onChange={field.onChange} error={errors.certificateMediaId?.message} allowedType="document" defaultFolder="education" />} />
      </FormSection>

      <FormSection title="النشر والعرض" columns={3}>
        <SwitchField label="منشور" register={register("isPublished")} error={errors.isPublished?.message} />
        <SwitchField label="مميز" register={register("isFeatured")} error={errors.isFeatured?.message} />
        <InputField label="الترتيب" type="number" min={0} dir="ltr" register={register("order")} error={errors.order?.message} />
      </FormSection>

      <SeoFieldsCard register={register} control={control} errors={errors} defaultFolder="education" />
    </div>
  );
}
