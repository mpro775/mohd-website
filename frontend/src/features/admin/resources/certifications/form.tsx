"use client";

import { useEffect } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import { FormSection } from "@/components/admin/forms/FormSection";
import { InputField, SelectField, SwitchField, TextAreaField } from "@/components/admin/forms/FieldComponents";
import { MediaField } from "@/components/admin/forms/MediaField";
import { SeoFieldsCard } from "@/components/admin/forms/SeoFieldsCard";
import { TagInput } from "@/components/admin/forms/TagInput";
import { useAdminOptions } from "../../hooks/use-options";
import type { CertificationFormValues } from "./schema";

export function CertificationForm({ form }: { form: UseFormReturn<CertificationFormValues> }) {
  const { register, control, watch, setValue, formState: { errors } } = form;
  const doesNotExpire = watch("doesNotExpire");
  const { data: options } = useAdminOptions();

  useEffect(() => {
    if (doesNotExpire) setValue("expiresAt", "", { shouldValidate: true });
  }, [doesNotExpire, setValue]);

  const typeOptions = (options?.certificationTypes ?? []).map((item) => ({
    value: item.value,
    label: item.labelAr || item.label || item.labelEn,
  }));

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <FormSection title="البيانات الأساسية" description="هوية الشهادة والجهة والمنصة." columns={2}>
        <div className="md:col-span-2"><InputField label="عنوان الشهادة" required register={register("title")} error={errors.title?.message} /></div>
        <InputField label="الرابط الفريد (Slug)" dir="ltr" register={register("slug")} error={errors.slug?.message} placeholder="aws-solutions-architect" />
        <SelectField label="نوع الشهادة" required register={register("type")} error={errors.type?.message} options={typeOptions.length ? typeOptions : [{ value: "course", label: "دورة تدريبية" }]} />
        <InputField label="الجهة المانحة" required register={register("issuer")} error={errors.issuer?.message} />
        <InputField label="المنصة" list="certification-platforms" register={register("platform")} error={errors.platform?.message} />
        <datalist id="certification-platforms">{(options?.certificationPlatformSuggestions ?? []).map((platform) => <option key={platform} value={platform} />)}</datalist>
        <InputField label="رابط المنصة" type="url" dir="ltr" register={register("platformUrl")} error={errors.platformUrl?.message} />
        <InputField label="التصنيف" register={register("category")} error={errors.category?.message} />
        <InputField label="اللغة" register={register("language")} error={errors.language?.message} />
      </FormSection>

      <FormSection title="التحقق والتواريخ" columns={2}>
        <InputField label="Credential ID" dir="ltr" register={register("credentialId")} error={errors.credentialId?.message} />
        <InputField label="Credential URL" type="url" dir="ltr" register={register("credentialUrl")} error={errors.credentialUrl?.message} />
        <InputField label="تاريخ الإصدار" type="date" dir="ltr" register={register("issuedAt")} error={errors.issuedAt?.message} />
        <SwitchField label="لا تنتهي صلاحيتها" description="يمسح تاريخ الانتهاء عند التفعيل." register={register("doesNotExpire")} error={errors.doesNotExpire?.message} />
        {!doesNotExpire ? <InputField label="تاريخ الانتهاء" type="date" dir="ltr" register={register("expiresAt")} error={errors.expiresAt?.message} /> : null}
        <InputField label="المدة بالساعات" type="number" min={0} dir="ltr" register={register("durationHours")} error={errors.durationHours?.message} />
      </FormSection>

      <FormSection title="الوصف والمهارات" columns={1}>
        <TextAreaField label="الوصف" rows={6} register={register("description")} error={errors.description?.message} />
        <Controller control={control} name="skills" render={({ field }) => <TagInput label="المهارات" value={field.value} onChange={field.onChange} error={errors.skills?.message} />} />
      </FormSection>

      <FormSection title="الوسائط" columns={2}>
        <Controller control={control} name="imageMediaId" render={({ field }) => <MediaField label="صورة الشهادة" valueId={field.value} valueUrl={watch("image")} onChange={field.onChange} error={errors.imageMediaId?.message} allowedType="image" defaultFolder="certifications" />} />
        <Controller control={control} name="documentMediaId" render={({ field }) => <MediaField label="ملف الشهادة PDF" valueId={field.value} valueUrl={watch("document")} onChange={field.onChange} error={errors.documentMediaId?.message} allowedType="document" defaultFolder="certifications" />} />
        <Controller control={control} name="issuerLogoMediaId" render={({ field }) => <MediaField label="شعار الجهة" valueId={field.value} valueUrl={watch("issuerLogo")} onChange={field.onChange} error={errors.issuerLogoMediaId?.message} allowedType="image" defaultFolder="certifications" />} />
      </FormSection>

      <FormSection title="العرض والنشر" columns={3}>
        <SwitchField label="منشورة" register={register("isPublished")} error={errors.isPublished?.message} />
        <SwitchField label="مميزة" register={register("isFeatured")} error={errors.isFeatured?.message} />
        <InputField label="الترتيب" type="number" min={0} dir="ltr" register={register("order")} error={errors.order?.message} />
      </FormSection>

      <SeoFieldsCard register={register} control={control} errors={errors} defaultFolder="certifications" />
    </div>
  );
}
