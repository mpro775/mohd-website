"use client";

import React, { useEffect, useState } from "react";
import { UseFormReturn, Controller } from "react-hook-form";
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
import type { PostFormValues } from "./schema";
import { toast } from "sonner";

interface PostFormProps {
  form: UseFormReturn<PostFormValues>;
  onSubmit?: any;
}

interface CategoryOption {
  id?: string;
  _id?: string;
  name: string;
}

interface TagOption {
  id?: string;
  _id?: string;
  name: string;
}

export function PostForm({ form }: PostFormProps) {
  const { register, control, formState: { errors }, watch, setValue } = form;
  
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [tagsList, setTagsList] = useState<TagOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const selectedStatus = watch("status");

  // Fetch dynamic categories and tags from proxied endpoints
  useEffect(() => {
    async function loadOptions() {
      setLoadingOptions(true);
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch("/api/admin-proxy/admin/blog/categories"),
          fetch("/api/admin-proxy/admin/blog/tags"),
        ]);

        if (catRes.ok && tagRes.ok) {
          const catData = await catRes.json();
          const tagData = await tagRes.json();

          setCategories(catData.data?.items ?? catData.data ?? []);
          setTagsList(tagData.data?.items ?? tagData.data ?? []);
        }
      } catch {
        toast.error("تعذر تحميل التصنيفات أو الوسوم الديناميكية");
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  const categoryOptions = [
    { label: "اختر تصنيفاً للمقال...", value: "" },
    ...categories.map((cat) => ({
      label: cat.name,
      value: cat.id ?? cat._id ?? "",
    })),
  ];

  const currentTags = watch("tags") || [];

  const handleTagToggle = (tagId: string) => {
    if (currentTags.includes(tagId)) {
      setValue("tags", currentTags.filter((t) => t !== tagId));
    } else {
      setValue("tags", [...currentTags, tagId]);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* 1. Basic Content details */}
      <FormSection title="البيانات الأساسية للمقال" description="عنوان المقال والملخص التعريفي القصير.">
        <InputField
          label="عنوان المقال"
          placeholder="أدخل عنواناً جذاباً ومختصراً للمقال..."
          required
          register={register("title")}
          error={errors.title?.message}
        />

        <InputField
          label="الرابط الفريد (Slug)"
          placeholder="اتركه فارغاً ليتم توليده تلقائياً من العنوان"
          register={register("slug")}
          error={errors.slug?.message}
        />

        <TextAreaField
          label="ملخص المقال (أكثر من 20 حرفاً)"
          placeholder="أدخل ملخصاً مشوقاً للمقال ليظهر في قائمة المقالات الرئيسية..."
          required
          register={register("summary")}
          error={errors.summary?.message}
          rows={3}
        />

        <TextAreaField
          label="المقتطف السريع (موجز اختياري)"
          placeholder="أدخل مقتطفاً سريعاً لنتائج محركات البحث..."
          register={register("excerpt")}
          error={errors.excerpt?.message}
          rows={2}
        />
      </FormSection>

      {/* 2. Full Article body */}
      <FormSection title="محتوى المقال الكامل" description="اكتب المقال بالكامل باستخدام لغة Markdown لمزيد من التنسيق التفاعلي.">
        <TextAreaField
          label="نص المقال الكامل (Markdown)"
          placeholder="اكتب هنا محتوى مقالك بالكامل مستخدماً وسوم وعلامات Markdown..."
          required
          register={register("content")}
          error={errors.content?.message}
          rows={12}
        />
      </FormSection>

      {/* 3. Taxonomy settings */}
      <FormSection title="التصنيفات والوسوم" description="حدد التصنيف والوسوم لربطها بالمقالات المماثلة." columns={2}>
        <SelectField
          label="التصنيف الأساسي"
          required
          options={categoryOptions}
          register={register("category")}
          error={errors.category?.message}
        />

        <div className="space-y-2 w-full select-none">
          <FieldLabel label="وسوم المقال" />
          {loadingOptions ? (
            <p className="text-[10px] text-muted-foreground animate-pulse text-right">جاري تحميل الوسوم...</p>
          ) : tagsList.length === 0 ? (
            <p className="text-[10px] text-muted-foreground text-right">لم يتم العثور على أية وسوم مضافة حالياً.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 justify-start">
              {tagsList.map((tag) => {
                const tagId = tag.id ?? tag._id ?? "";
                const isSelected = currentTags.includes(tagId);

                return (
                  <button
                    key={tagId}
                    type="button"
                    onClick={() => handleTagToggle(tagId)}
                    className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold transition select-none cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/75"
                    }`}
                  >
                    <span>{tag.name}</span>
                  </button>
                );
              })}
            </div>
          )}
          <FieldError error={errors.tags?.message} />
        </div>
      </FormSection>

      {/* 4. Publication Settings */}
      <FormSection title="إعدادات وحالة النشر" description="تحديد حالة وتواريخ نشر المقال." columns={2}>
        <SelectField
          label="حالة المقال"
          required
          options={[
            { label: "مسودة (Draft)", value: "draft" },
            { label: "منشور مباشرة (Published)", value: "published" },
            { label: "مجدول (Scheduled)", value: "scheduled" },
            { label: "مؤرشف (Archived)", value: "archived" },
          ]}
          register={register("status")}
          error={errors.status?.message}
        />

        <InputField
          label="وقت القراءة المقدر (بالدقائق)"
          type="number"
          placeholder="مثال: 5 دقائق"
          register={register("readTime", { valueAsNumber: true })}
          error={errors.readTime?.message}
        />

        {selectedStatus === "published" && (
          <InputField
            label="تاريخ النشر الفعلي"
            type="datetime-local"
            register={register("publishDate")}
            error={errors.publishDate?.message}
            className="w-full"
          />
        )}

        {selectedStatus === "scheduled" && (
          <InputField
            label="تاريخ الجدولة المأمول"
            type="datetime-local"
            register={register("scheduledAt")}
            error={errors.scheduledAt?.message}
            className="w-full"
          />
        )}

        <InputField
          label="رابط Canonical URL المفضل"
          type="url"
          placeholder="https://mywebsite.com/blog/my-post"
          register={register("canonicalUrl")}
          error={errors.canonicalUrl?.message}
        />

        <div className="md:col-span-2 space-y-2 border-t border-border/40 pt-4 mt-2">
          <SwitchField
            label="تمييز المقال في المدونة (Featured Post)"
            description="عند تفعيله، سيتم تثبيت المقال وإبرازه في المدونة الرئيسية."
            register={register("isFeatured")}
            error={errors.isFeatured?.message}
          />

          <SwitchField
            label="السماح بفهرسة الصفحة لمحركات البحث"
            description="عند تفعيله، سيُسمح لعناكب البحث بأرشفة وقراءة المقال."
            register={register("allowIndexing")}
            error={errors.allowIndexing?.message}
          />
        </div>
      </FormSection>

      {/* 5. Images media */}
      <FormSection title="صور ووسائط المقال" description="تعيين الصورة البارزة وصور الغلاف." columns={2}>
        {/* Featured Image */}
        <Controller
          control={control}
          name="featuredImage"
          render={({ field }) => (
            <MediaField
              label="الصورة البارزة للمقال (Thumbnail)"
              value={field.value || undefined}
              onChange={field.onChange}
              error={errors.featuredImage?.message}
              allowedType="image"
              defaultFolder="blog"
            />
          )}
        />

        {/* Cover Image */}
        <Controller
          control={control}
          name="coverImage"
          render={({ field }) => (
            <MediaField
              label="صورة الغلاف الكاملة (Cover Image)"
              value={field.value || undefined}
              onChange={field.onChange}
              error={errors.coverImage?.message}
              allowedType="image"
              defaultFolder="blog"
            />
          )}
        />
      </FormSection>

      {/* 6. SEO Card */}
      <SeoFieldsCard
        register={register}
        control={control}
        errors={errors}
        defaultFolder="blog"
      />
    </div>
  );
}
