"use client";

import React, { useState } from "react";
import { UseFormReturn, Controller } from "react-hook-form";
import { Plus, X } from "lucide-react";
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

interface ProjectFormProps {
  form: UseFormReturn<ProjectFormValues>;
  onSubmit?: any;
}

export function ProjectForm({ form }: ProjectFormProps) {
  const { register, control, formState: { errors }, watch, setValue } = form;
  const [techInput, setTechInput] = useState("");

  const currentTechs = watch("technologies") || [];

  const handleAddTech = (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = techInput.trim();
    if (clean && !currentTechs.includes(clean)) {
      setValue("technologies", [...currentTechs, clean]);
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    setValue("technologies", currentTechs.filter((t) => t !== tech));
  };

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
            { label: "تطوير مواقع (web)", value: "web" },
            { label: "تطبيقات هواتف (mobile)", value: "mobile" },
            { label: "واجهات وتصميم (ui-ux)", value: "ui-ux" },
            { label: "أخرى (other)", value: "other" },
          ]}
          register={register("category")}
          error={errors.category?.message}
        />

        <div className="md:col-span-2">
          <SelectField
            label="حالة المشروع البرمجية"
            required
            options={[
              { label: "مكتمل وناجح (Completed)", value: "completed" },
              { label: "قيد التطوير والعمل (In Progress)", value: "in-progress" },
              { label: "متوقف مؤقتاً (Paused)", value: "paused" },
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
          name="coverImage"
          render={({ field }) => (
            <MediaField
              label="صورة الغلاف للمشروع"
              value={field.value || undefined}
              onChange={field.onChange}
              error={errors.coverImage?.message}
              allowedType="image"
              defaultFolder="projects"
            />
          )}
        />

        {/* Technologies Input chips */}
        <div className="space-y-2 w-full select-none mt-2">
          <FieldLabel label="التقنيات المستخدمة" />
          
          <div className="flex gap-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="مثال: Next.js, React, Node.js..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTech(e as any);
                }
              }}
              className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs outline-none focus:border-primary"
            />
            <button
              onClick={handleAddTech}
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground hover:bg-primary/95 cursor-pointer transition select-none"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إضافة</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2">
            {currentTechs.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">لم يتم إضافة أية تقنيات للمشروع بعد.</p>
            ) : (
              currentTechs.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 rounded bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary select-none"
                >
                  <span>{tech}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="rounded-full p-0.5 hover:bg-secondary/20 hover:text-white transition cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))
            )}
          </div>
          <FieldError error={errors.technologies?.message} />
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
