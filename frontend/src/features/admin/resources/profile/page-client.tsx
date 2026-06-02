"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { 
  User, 
  FileText, 
  Share2, 
  GraduationCap, 
  Globe, 
  Save, 
  RefreshCw
} from "lucide-react";

import { clientApiRequest } from "@/lib/api/admin-client";
import { adminQueryKeys } from "@/lib/api/admin-query-keys";
import { handleAdminError, setFormErrors } from "@/lib/api/admin-errors";
import type { Profile } from "@/lib/api/types";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FormSection } from "@/components/admin/forms/FormSection";
import { InputField, TextAreaField, SwitchField, SelectField } from "@/components/admin/forms/FieldComponents";
import { MediaField } from "@/components/admin/forms/MediaField";
import { RepeaterField } from "@/components/admin/forms/RepeaterField";
import { SeoFieldsCard } from "@/components/admin/forms/SeoFieldsCard";
import { profileFormSchema, ProfileFormValues } from "./schema";
import { Button } from "@/components/common/Button";

export function ProfilePageClient() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"personal" | "bio" | "contact" | "education" | "seo">("personal");

  // React Hook Form initialization
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      title: "",
      headline: "",
      bio: "",
      about: "",
      email: "",
      phone: "",
      location: "",
      profileImage: null,
      cvFile: null,
      yearsOfExperience: 0,
      availableForWork: false,
      socialLinks: [],
      languages: [],
      certificates: [],
      seo: {
        metaTitle: "",
        metaDescription: "",
        ogImage: "",
      },
    },
  });

  const { register, control, handleSubmit, reset, setError, formState: { errors } } = form;

  // 1. Fetch Profile Data
  const { data: profile, isLoading, isRefetching, refetch } = useQuery<Profile>({
    queryKey: adminQueryKeys.resource("profile"),
    queryFn: async () => {
      const response = await clientApiRequest<Profile | Profile[]>("profile");
      const data = response.data;
      if (Array.isArray(data)) {
        return data[0];
      }
      return data;
    },
  });

  // 2. Populate form when data is loaded
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || "",
        title: profile.title || "",
        headline: profile.headline || "",
        bio: profile.bio || "",
        about: profile.about || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        profileImage: profile.profileImage || null,
        cvFile: profile.cvFile || null,
        yearsOfExperience: profile.yearsOfExperience || 0,
        availableForWork: !!profile.availableForWork,
        socialLinks: profile.socialLinks || [],
        languages: profile.languages || [],
        certificates: profile.certificates || [],
        seo: {
          metaTitle: profile.seo?.metaTitle || "",
          metaDescription: profile.seo?.metaDescription || "",
          ogImage: profile.seo?.ogImage || "",
        },
      });
    }
  }, [profile, reset]);

  // 3. Save Profile Mutation
  const saveMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      // Clean up values before saving
      const payload = {
        ...values,
        yearsOfExperience: values.yearsOfExperience !== "" ? Number(values.yearsOfExperience) : 0,
      };
      
      return clientApiRequest<Profile>("profile", {
        method: "PUT",
        body: payload,
      });
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "تم حفظ ملفك الشخصي بنظام بنجاح!");
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.resource("profile") });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
    },
    onError: (err) => {
      const isValidationMapped = setFormErrors(err, setError);
      if (!isValidationMapped) {
        handleAdminError(err, "فشل حفظ بيانات الملف الشخصي. يرجى التحقق من المدخلات.");
      }
    },
  });

  const onSubmit = handleSubmit((values: any) => {
    saveMutation.mutate(values);
  });

  // Tab definitions
  const tabs = [
    { id: "personal", label: "البيانات الشخصية", icon: User },
    { id: "bio", label: "النبذة والتفاصيل", icon: FileText },
    { id: "contact", label: "روابط التواصل الاجتماعي", icon: Share2 },
    { id: "education", label: "اللغات والشهادات", icon: GraduationCap },
    { id: "seo", label: "تحسين محركات البحث SEO", icon: Globe },
  ] as const;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <AdminPageHeader
        title="إعدادات الملف الشخصي"
        description="أدر معلومات سيرتك الذاتية، وصورتك الشخصية، وروابطك المهنية، لتعكس هويتك على واجهة الموقع بشكل احترافي."
      >
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none disabled:opacity-50"
          title="تحديث البيانات"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          <span>تحديث البيانات</span>
        </button>
      </AdminPageHeader>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-3 text-xs text-muted-foreground font-semibold">جاري تحميل بيانات الملف الشخصي...</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col lg:flex-row">
            
            {/* Tabs List Sidebar */}
            <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-l border-border bg-muted/20 shrink-0">
              <div className="p-4 border-b border-border/60 hidden lg:block">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">أقسام الملف</span>
                <span className="text-xs text-foreground font-bold mt-1 block">تخصيص الهوية الشخصية</span>
              </div>
              
              <nav className="p-2 space-y-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible custom-scrollbar">
                {tabs.map((tab) => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition text-right cursor-pointer select-none whitespace-nowrap lg:w-full ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <TabIcon className="h-4 w-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Form Panels Body */}
            <div className="flex-1 p-6 lg:p-8">
              
              {/* Tab 1: Personal Info */}
              {activeTab === "personal" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-border/40 pb-3 mb-2 text-right">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <User className="h-4.5 w-4.5 text-primary" />
                      <span>البيانات الأساسية والهوية المهنية</span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">الاسم، المسمى المهني، وعنوان السيرة الشخصية والصور.</p>
                  </div>

                  <FormSection title="البيانات الشخصية والمهنية" columns={2}>
                    <InputField
                      label="الاسم الكامل"
                      register={register("fullName")}
                      error={errors.fullName?.message}
                      required
                      placeholder="مثال: محمد بن علي"
                    />
                    <InputField
                      label="المسمى الوظيفي"
                      register={register("title")}
                      error={errors.title?.message}
                      required
                      placeholder="مثال: مطور ويب متكامل"
                    />
                    <div className="md:col-span-2">
                      <InputField
                        label="العنوان المختصر / الشعار"
                        register={register("headline")}
                        error={errors.headline?.message}
                        placeholder="مثال: مطور شغوف بالواجهات وتطبيقات الويب العصرية ذات الأداء الخارق"
                      />
                    </div>
                  </FormSection>

                  <div className="border-t border-border/40 my-6 pt-5" />

                  <FormSection title="الوسائط الشخصية والسيرة الذاتية" columns={2}>
                    <Controller
                      control={control as any}
                      name="profileImage"
                      render={({ field }) => (
                        <MediaField
                          label="الصورة الشخصية"
                          value={field.value || undefined}
                          onChange={field.onChange}
                          error={errors.profileImage?.message}
                          defaultFolder="profile"
                          allowedType="image"
                        />
                      )}
                    />
                    <Controller
                      control={control as any}
                      name="cvFile"
                      render={({ field }) => (
                        <MediaField
                          label="ملف السيرة الذاتية (CV)"
                          value={field.value || undefined}
                          onChange={field.onChange}
                          error={errors.cvFile?.message}
                          defaultFolder="cv"
                          allowedType="document"
                        />
                      )}
                    />
                  </FormSection>

                  <div className="border-t border-border/40 my-6 pt-5" />

                  <FormSection title="الخبرة المهنية والجهوزية" columns={2}>
                    <InputField
                      label="سنوات الخبرة"
                      type="number"
                      register={register("yearsOfExperience", { valueAsNumber: true })}
                      error={errors.yearsOfExperience?.message}
                      placeholder="مثال: 5"
                    />
                    <div className="flex items-center">
                      <SwitchField
                        label="متاح للعمل الحر حالياً"
                        description="تفعيل هذه الميزة يعرض إشعاراً في واجهة الموقع يدل على جهوزيتك لبدء مشاريع جديدة."
                        register={register("availableForWork")}
                        error={errors.availableForWork?.message}
                      />
                    </div>
                  </FormSection>
                </div>
              )}

              {/* Tab 2: Bio & Long Details */}
              {activeTab === "bio" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-border/40 pb-3 mb-2 text-right">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <FileText className="h-4.5 w-4.5 text-primary" />
                      <span>النبذة التعريفية والتفاصيل المطوّلة</span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">اكتب نبذة شيّقة عن هويتك المهنية لتعرض للزوار ومحركات البحث.</p>
                  </div>

                  <TextAreaField
                    label="السيرة التعريفية المختصرة"
                    register={register("bio")}
                    error={errors.bio?.message}
                    required
                    rows={4}
                    placeholder="نبذة سريعة تظهر في المقدمة والبطاقات التعريفية (على الأقل 10 أحرف)..."
                  />

                  <TextAreaField
                    label="السيرة الطويلة التفصيلية (عنّي)"
                    register={register("about")}
                    error={errors.about?.message}
                    rows={12}
                    placeholder="تفاصيل سيرة العمل الخاصة بك، شغفك، طريقتك في البناء، وكيف بدأت (يدعم نصوص المارك داون)..."
                  />
                </div>
              )}

              {/* Tab 3: Contact & Social links */}
              {activeTab === "contact" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-border/40 pb-3 mb-2 text-right">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Share2 className="h-4.5 w-4.5 text-primary" />
                      <span>وسائل التواصل وروابط التواصل المهنية</span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">قنوات الاتصال المباشرة ومكرر الروابط للشبكات الاجتماعية المهنية.</p>
                  </div>

                  <FormSection title="معلومات الاتصال المباشرة" columns={3}>
                    <InputField
                      label="البريد الإلكتروني"
                      type="email"
                      register={register("email")}
                      error={errors.email?.message}
                      required
                      placeholder="example@domain.com"
                    />
                    <InputField
                      label="رقم الهاتف (اختياري)"
                      register={register("phone")}
                      error={errors.phone?.message}
                      placeholder="+966 50 000 0000"
                    />
                    <InputField
                      label="الموقع الجغرافي"
                      register={register("location")}
                      error={errors.location?.message}
                      placeholder="الرياض، المملكة العربية السعودية"
                    />
                  </FormSection>

                  <div className="border-t border-border/40 my-6 pt-5" />

                  {/* Social links repeater */}
                  <RepeaterField
                    control={control as any}
                    name="socialLinks"
                    label="روابط الشبكات المهنية والاجتماعية"
                    description="أضف قنوات تواصل إضافية مثل GitHub, LinkedIn, Twitter وغيرها لتعرض للمستخدمين."
                    addButtonLabel="إضافة رابط شبكة جديد"
                    emptyItem={{ platform: "", url: "" }}
                  >
                    {({ index }) => (
                      <div className="grid gap-4 md:grid-cols-2 flex-1 text-right">
                        <SelectField
                          label="منصة التواصل"
                          register={register(`socialLinks.${index}.platform`)}
                          error={errors.socialLinks?.[index]?.platform?.message}
                          required
                          options={[
                            { label: "اختر منصة", value: "" },
                            { label: "GitHub", value: "github" },
                            { label: "LinkedIn", value: "linkedin" },
                            { label: "Twitter / X", value: "twitter" },
                            { label: "Facebook", value: "facebook" },
                            { label: "Instagram", value: "instagram" },
                            { label: "YouTube", value: "youtube" },
                            { label: "Dribbble", value: "dribbble" },
                            { label: "Behance", value: "behance" },
                            { label: "Website", value: "website" },
                          ]}
                        />
                        <InputField
                          label="رابط الحساب الكامل (URL)"
                          register={register(`socialLinks.${index}.url`)}
                          error={errors.socialLinks?.[index]?.url?.message}
                          required
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </RepeaterField>
                </div>
              )}

              {/* Tab 4: Languages & Certificates */}
              {activeTab === "education" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-border/40 pb-3 mb-2 text-right">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <GraduationCap className="h-4.5 w-4.5 text-primary" />
                      <span>اللغات والشهادات العلمية والمهنية</span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">وثّق لغاتك والشهادات الفنية الحاصل عليها لإبراز مصداقيتك.</p>
                  </div>

                  {/* Languages Repeater */}
                  <RepeaterField
                    control={control as any}
                    name="languages"
                    label="اللغات التي تتقنها"
                    description="أضف اللغات مع تحديد مستوى الكفاءة أو الطلاقة لكل منها."
                    addButtonLabel="إضافة لغة جديدة"
                    emptyItem={{ name: "", level: "" }}
                  >
                    {({ index }) => (
                      <div className="grid gap-4 md:grid-cols-2 flex-1 text-right">
                        <InputField
                          label="اللغة"
                          register={register(`languages.${index}.name`)}
                          error={errors.languages?.[index]?.name?.message}
                          required
                          placeholder="مثال: العربية، الإنجليزية"
                        />
                        <InputField
                          label="المستوى"
                          register={register(`languages.${index}.level`)}
                          error={errors.languages?.[index]?.level?.message}
                          placeholder="مثال: اللغة الأم، طلاقة متحدث، متوسط"
                        />
                      </div>
                    )}
                  </RepeaterField>

                  <div className="border-t border-border/40 my-6 pt-5" />

                  {/* Certificates Repeater */}
                  <RepeaterField
                    control={control as any}
                    name="certificates"
                    label="الشهادات المهنية والأكاديمية"
                    description="أضف الشهادات أو الاعتمادات الفنية التي حصلت عليها مع الجهة المانحة والتاريخ."
                    addButtonLabel="إضافة شهادة جديدة"
                    emptyItem={{ title: "", issuer: "", date: "", url: "" }}
                  >
                    {({ index }) => (
                      <div className="grid gap-4 md:grid-cols-2 flex-1 text-right">
                        <InputField
                          label="عنوان الشهادة"
                          register={register(`certificates.${index}.title`)}
                          error={errors.certificates?.[index]?.title?.message}
                          required
                          placeholder="مثال: شهادة مطور AWS معتمد"
                        />
                        <InputField
                          label="الجهة المانحة"
                          register={register(`certificates.${index}.issuer`)}
                          error={errors.certificates?.[index]?.issuer?.message}
                          placeholder="مثال: Amazon Web Services"
                        />
                        <InputField
                          label="تاريخ الحصول عليها"
                          type="date"
                          register={register(`certificates.${index}.date`)}
                          error={errors.certificates?.[index]?.date?.message}
                        />
                        <InputField
                          label="رابط إثبات الشهادة / التحقق (URL)"
                          register={register(`certificates.${index}.url`)}
                          error={errors.certificates?.[index]?.url?.message}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </RepeaterField>
                </div>
              )}

              {/* Tab 5: SEO */}
              {activeTab === "seo" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="border-b border-border/40 pb-3 mb-2 text-right">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Globe className="h-4.5 w-4.5 text-primary" />
                      <span>تهيئة محركات البحث (SEO) للملف التعريفي</span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">قم بإعداد العناوين والوصف وصور الـ Open Graph لزيادة فرصة ظهور بروفايلك في قوقل.</p>
                  </div>

                  <SeoFieldsCard
                    register={register as any}
                    control={control as any}
                    errors={errors as any}
                    defaultFolder="profile"
                  />
                </div>
              )}

            </div>
          </div>

          {/* Sticky/Fixed Bottom Save Actions Footer */}
          <div className="rounded-xl border border-border bg-card/75 backdrop-blur-md p-4 shadow-md flex items-center justify-between gap-3 sticky bottom-4">
            <p className="text-[10px] text-muted-foreground">
              يرجى مراجعة كافة الحقول وتعبئة البيانات المطلوبة قبل إتمام عملية الحفظ.
            </p>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-6 h-10 text-xs font-bold cursor-pointer"
            >
              {saveMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>جاري الحفظ والتحقق...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>حفظ التغييرات بالملف الشخصي</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
