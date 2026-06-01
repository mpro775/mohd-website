import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminTechnologiesPage() {
  return (
    <AdminResourceManager
      config={{
        title: "إدارة التقنيات",
        endpoint: "admin/technologies",
        actions: [
          { label: "نشر", path: "publish", method: "PATCH" },
          { label: "إلغاء النشر", path: "unpublish", method: "PATCH" },
        ],
        starter: { name: "", slug: "", description: "", category: "frontend", proficiencyLevel: "intermediate", isPublished: true, highlighted: false },
        fields: [
          { name: "name", label: "اسم التقنية", required: true },
          { name: "slug", label: "الرابط الفريد (اتركه فارغاً للتوليد التلقائي)" },
          { name: "description", label: "الوصف أو الاستخدام", type: "textarea", rows: 3 },
          { name: "icon", label: "أيقونة التقنية / شعارها", type: "image" },
          { name: "category", label: "المجموعة الرئيسية (مثال: frontend, backend)", required: true },
          { name: "group", label: "المجموعة الفرعية (مثال: Frameworks, Languages)" },
          { name: "proficiencyLevel", label: "مستوى الخبرة / Proficiency Level", type: "select", options: [
            { label: "مبتدئ (beginner)", value: "beginner" },
            { label: "متوسط (intermediate)", value: "intermediate" },
            { label: "متقدم (advanced)", value: "advanced" },
            { label: "خبير (expert)", value: "expert" }
          ]},
          { name: "officialUrl", label: "الرابط الرسمي لموقع التقنية", type: "url" },
          { name: "yearsOfExperience", label: "سنوات الخبرة العملية", type: "number" },
          { name: "color", label: "اللون التعريفي (مثال: #37d399)", placeholder: "#37d399" },
          { name: "highlighted", label: "تمييز التقنية في الرئيسية", type: "checkbox" },
          { name: "isPublished", label: "منشورة ومعروضة", type: "checkbox" },
        ],
      }}
    />
  );
}
