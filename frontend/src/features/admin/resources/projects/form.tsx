"use client";

import React, { useState, useEffect } from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import { Plus, X, Trash2, Upload } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminClient } from "@/lib/api/admin-client";
import type { Technology } from "@/lib/api/types";
import {
  InputField,
  TextAreaField,
  SelectField,
  SwitchField,
  FieldLabel,
  FieldError,
} from "@/components/admin/forms/FieldComponents";
import { MediaField } from "@/components/admin/forms/MediaField";
import { SeoFieldsCard } from "@/components/admin/forms/SeoFieldsCard";
import { FormSection } from "@/components/admin/forms/FormSection";
import type { ProjectFormValues } from "./schema";
import { useAdminOptions } from "../../hooks/use-options";
import { MediaPicker } from "@/components/admin/MediaPicker";

interface ProjectFormProps {
  form: UseFormReturn<ProjectFormValues, any, any>;
  onSubmit?: any;
}

// Sub-component for managing project gallery media IDs
interface ProjectGalleryFieldProps {
  valueIds?: string[];
  valueUrls?: string[];
  onChange: (ids: string[]) => void;
}

export function ProjectGalleryField({ valueIds = [], valueUrls = [], onChange }: ProjectGalleryFieldProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [localItems, setLocalItems] = useState<{ id: string; url: string }[]>([]);

  useEffect(() => {
    const items = valueIds.map((id, index) => ({
      id,
      url: valueUrls[index] || "",
    }));
    setLocalItems(items);
  }, [valueIds, valueUrls]);

  const handleAdd = (item: any) => {
    const id = item._id || item.id;
    if (id && !valueIds.includes(id)) {
      const nextIds = [...valueIds, id];
      const nextItems = [...localItems, { id, url: item.url }];
      setLocalItems(nextItems);
      onChange(nextIds);
    }
    setIsPickerOpen(false);
  };

  const handleRemove = (id: string) => {
    const nextIds = valueIds.filter((x) => x !== id);
    const nextItems = localItems.filter((x) => x.id !== id);
    setLocalItems(nextItems);
    onChange(nextIds);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card/35 p-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {localItems.map((item, index) => (
          <div key={item.id + index} className="group relative aspect-video rounded-lg border border-border bg-muted/40 overflow-hidden">
            {item.url ? (
              <img src={item.url} alt="Gallery item" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">صورة المعرض</div>
            )}
            <button
              type="button"
              onClick={() => handleRemove(item.id)}
              className="absolute top-1.5 right-1.5 h-6 w-6 rounded bg-black/60 text-danger hover:bg-black/80 flex items-center justify-center transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => setIsPickerOpen(true)}
          className="flex aspect-video flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/45 p-2 hover:border-primary/50 hover:bg-background/80 transition cursor-pointer select-none"
        >
          <Upload className="h-4 w-4 text-muted-foreground mb-1" />
          <span className="text-[10px] font-bold text-primary">إضافة صورة</span>
        </button>
      </div>

      <MediaPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleAdd}
        allowMultiple={true}
        onSelectMultiple={(items) => {
          const newIds = items.map((i) => i._id || i.id).filter(Boolean) as string[];
          const uniqueNewIds = newIds.filter((id) => !valueIds.includes(id));
          if (uniqueNewIds.length > 0) {
            const nextIds = [...valueIds, ...uniqueNewIds];
            const newLocalItems = items
              .filter((i) => uniqueNewIds.includes((i._id || i.id)!))
              .map((i) => ({ id: (i._id || i.id)!, url: i.url }));
            setLocalItems([...localItems, ...newLocalItems]);
            onChange(nextIds);
          }
          setIsPickerOpen(false);
        }}
        allowedType="image"
        defaultFolder="projects"
      />
    </div>
  );
}

export function ProjectForm({ form }: ProjectFormProps) {
  const { register, control, formState: { errors }, watch, setValue } = form;
  const { data: optionsData } = useAdminOptions();

  // Fetch all technologies for selection
  const { data: techListData } = useQuery({
    queryKey: ["technologies-list-all"],
    queryFn: async () => {
      const res = await adminClient.listResource<Technology>("technologies", { limit: 100 });
      return res.items || [];
    },
  });

  const currentTechSlugs = watch("technologySlugs") || [];

  const categoryOptions = (optionsData?.projectCategories || []).map((c) => ({
    label: c.labelAr,
    value: c.value,
  }));

  const statusOptions = (optionsData?.projectStatuses || []).map((s) => ({
    label: s.labelAr,
    value: s.value,
  }));

  const availableTechs = (techListData || []).filter(
    (tech) => !currentTechSlugs.includes(tech.slug)
  );

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. Basic Info */}
      <FormSection title="البيانات الأساسية للمشروع" description="عنوان المشروع وتصنيفه الأساسي وحالته الحالية." columns={2}>
        <div className="md:col-span-2">
          <InputField
            label="عنوان المشروع"
            placeholder="مثال: منصة التجارة الإلكترونية الفاخرة..."
            required
            register={register("title")}
            error={errors.title?.message}
          />
        </div>

        <InputField
          label="الرابط الفريد (Slug)"
          placeholder="اتركه فارغاً ليتم توليده تلقائياً"
          register={register("slug")}
          error={errors.slug?.message}
        />

        <SelectField
          label="تصنيف المشروع"
          required
          options={[
            { label: "جاري التحميل...", value: "" },
            ...categoryOptions,
          ]}
          register={register("category")}
          error={errors.category?.message}
        />

        <div className="md:col-span-2">
          <SelectField
            label="حالة المشروع البرمجية"
            required
            options={[
              { label: "جاري التحميل...", value: "" },
              ...statusOptions,
            ]}
            register={register("status")}
            error={errors.status?.message}
          />
        </div>
      </FormSection>

      {/* 2. Descriptions */}
      <FormSection title="وصف وتفاصيل العمل" description="الملخص القصير والتفاصيل الكاملة لمسار بناء المشروع.">
        <TextAreaField
          label="وصف المشروع القصير"
          placeholder="اكتب خلاصة سريعة ومثيرة للاهتمام حول هذا المشروع..."
          required
          register={register("shortDescription")}
          error={errors.shortDescription?.message}
          rows={3}
        />

        <TextAreaField
          label="الوصف التفصيلي الكامل للمشروع"
          placeholder="اكتب بالتفصيل مسار العمل وحجم التقنيات والمخرجات الكاملة..."
          required
          register={register("detailedDescription")}
          error={errors.detailedDescription?.message}
          rows={6}
        />
      </FormSection>

      {/* 3. Media & Technologies */}
      <FormSection title="الوسائط والتقنيات المستخدمة" description="صورة الغلاف والتقنيات المستعملة في بناء المشروع.">
        {/* Cover Image */}
        <Controller
          control={control}
          name="coverImageMediaId"
          render={({ field }) => (
            <MediaField
              label="صورة الغلاف للمشروع"
              valueId={field.value}
              valueUrl={watch("coverImage" as any)}
              onChange={field.onChange}
              error={errors.coverImageMediaId?.message}
              allowedType="image"
              defaultFolder="projects"
            />
          )}
        />

        {/* Gallery Multi-Picker */}
        <div className="md:col-span-2 space-y-2 mt-4">
          <FieldLabel label="معرض صور المشروع (Gallery)" />
          <Controller
            control={control}
            name="galleryMediaIds"
            render={({ field }) => (
              <ProjectGalleryField
                valueIds={field.value}
                valueUrls={watch("gallery" as any) || []}
                onChange={field.onChange}
              />
            )}
          />
          <FieldError error={errors.galleryMediaIds?.message} />
        </div>

        {/* Technologies Selection */}
        <div className="space-y-2 w-full select-none mt-4">
          <FieldLabel label="التقنيات المستخدمة للمشروع" />
          
          <div className="flex gap-2">
            <select
              value=""
              onChange={(e) => {
                const slug = e.target.value;
                if (slug && !currentTechSlugs.includes(slug)) {
                  setValue("technologySlugs", [...currentTechSlugs, slug]);
                }
              }}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs outline-none focus:border-primary"
            >
              <option value="">-- اختر تقنية لإضافتها للمشروع --</option>
              {availableTechs.map((tech) => (
                <option key={tech.id || tech._id} value={tech.slug}>
                  {tech.name} ({tech.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {currentTechSlugs.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">لم يتم إضافة أية تقنيات للمشروع بعد.</p>
            ) : (
              currentTechSlugs.map((slug) => {
                const techObj = (techListData || []).find((t) => t.slug === slug);
                return (
                  <span
                    key={slug}
                    className="inline-flex items-center gap-1 rounded bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary select-none"
                  >
                    <span>{techObj?.name || slug}</span>
                    <button
                      type="button"
                      onClick={() => setValue("technologySlugs", currentTechSlugs.filter((s) => s !== slug))}
                      className="rounded-full p-0.5 hover:bg-secondary/20 hover:text-white transition cursor-pointer"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
          <FieldError error={errors.technologySlugs?.message} />
        </div>
      </FormSection>

      {/* 4. External Links */}
      <FormSection title="روابط ومصادر المشروع" description="روابط المعاينة المباشرة ومستودعات الكود." columns={2}>
        <InputField
          label="رابط حي للمعاينة (Live Demo URL)"
          type="url"
          placeholder="https://myproject.com"
          register={register("liveUrl")}
          error={errors.liveUrl?.message}
        />

        <InputField
          label="رابط مستودع الكود (GitHub Repository URL)"
          type="url"
          placeholder="https://github.com/username/project"
          register={register("githubUrl")}
          error={errors.githubUrl?.message}
        />
      </FormSection>

      {/* 4.5. Additional Details */}
      <FormSection title="تفاصيل إضافية للمشروع" description="اسم العميل وتواريخ بداية ونهاية المشروع." columns={2}>
        <div className="md:col-span-2">
          <InputField
            label="اسم العميل"
            placeholder="مثال: شركة الحلول البرمجية..."
            register={register("clientName")}
            error={errors.clientName?.message}
          />
        </div>

        <InputField
          label="تاريخ البدء"
          type="date"
          register={register("startDate")}
          error={errors.startDate?.message}
        />

        <InputField
          label="تاريخ الانتهاء"
          type="date"
          register={register("endDate")}
          error={errors.endDate?.message}
        />

        <div className="md:col-span-2">
          <InputField
            label="تاريخ اكتمال المشروع"
            type="date"
            register={register("completionDate")}
            error={errors.completionDate?.message}
          />
        </div>
      </FormSection>

      {/* 5. Case Study Fields */}
      <FormSection title="دراسة الحالة الكاملة (Case Study)" description="تفاصيل معقدة حول التحديات والحلول وتفاصيل دورك الشخصي.">
        <InputField
          label="دوري ومهمتي الشخصية في المشروع"
          placeholder="مثال: Full Stack Developer / UI Designer"
          register={register("role")}
          error={errors.role?.message}
        />

        <TextAreaField
          label="المشكلة والتحديات التي تم مواجهتها"
          placeholder="ما هي العقبات والاحتياجات البرمجية التي واجهتها؟..."
          register={register("problem")}
          error={errors.problem?.message}
          rows={3}
        />

        <TextAreaField
          label="الحل الهندسي والبرمجي المتخذ"
          placeholder="كيف تم صياغة الحل واستدعاء التقنيات وبناء الواجهات؟..."
          register={register("solution")}
          error={errors.solution?.message}
          rows={3}
        />

        <TextAreaField
          label="النتائج النهائية ومخرجات العمل"
          placeholder="ما هي المساهمة والأرقام ومخرجات الأداء النهائية؟..."
          register={register("results")}
          error={errors.results?.message}
          rows={3}
        />

        <TextAreaField
          label="دراسة الحالة الكاملة (تفاصيل المقال الكلية)"
          placeholder="اكتب هنا سرداً كاملاً لدراسة الحالة والمشروع..."
          register={register("caseStudy")}
          error={errors.caseStudy?.message}
          rows={6}
        />
      </FormSection>

      {/* 6. Settings toggles */}
      <FormSection title="خيارات إضافية">
        <SwitchField
          label="منشور ومتاح للعامة في المعرض"
          description="عند إلغاء تفعيله، سيتم حفظ المشروع كمسودة مخفية للمشرفين فقط."
          register={register("isPublished")}
          error={errors.isPublished?.message}
        />

        <SwitchField
          label="تمييز المشروع وتثبيته في المعرض الرئيسي"
          description="عند تفعيله، سيتم تثبيت المشروع في الصفحة الرئيسية لمعرض الأعمال."
          register={register("featured")}
          error={errors.featured?.message}
        />
      </FormSection>

      {/* 7. SEO accordion */}
      <SeoFieldsCard
        register={register as any}
        control={control as any}
        errors={errors as any}
        defaultFolder="projects"
      />
    </div>
  );
}
