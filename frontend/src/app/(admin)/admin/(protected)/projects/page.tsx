import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminProjectsPage() {
  return (
    <AdminResourceManager
      config={{
        title: "إدارة المشاريع",
        endpoint: "admin/projects",
        actions: [
          { label: "نشر", path: "publish", method: "PATCH" },
          { label: "إلغاء النشر", path: "unpublish", method: "PATCH" },
          { label: "أرشفة", path: "archive", method: "PATCH" },
        ],
        starter: { title: "", slug: "", shortDescription: "", detailedDescription: "", category: "web", technologies: [], isPublished: true, featured: false },
        fields: [
          { name: "title", label: "العنوان", required: true },
          { name: "slug", label: "الرابط الفريد (اتركه فارغاً للتوليد التلقائي)" },
          { name: "category", label: "التصنيف (مثال: web, mobile)", required: true },
          { name: "status", label: "الحالة", type: "select", options: [{ label: "مكتمل", value: "completed" }, { label: "قيد التنفيذ", value: "in-progress" }, { label: "متوقف", value: "paused" }] },
          { name: "shortDescription", label: "وصف قصير", type: "textarea", required: true, rows: 3 },
          { name: "detailedDescription", label: "وصف تفصيلي", type: "textarea", required: true, rows: 6 },
          { name: "technologies", label: "التقنيات المستخدمة (افصل بفواصل)", type: "array" },
          { name: "coverImage", label: "صورة الغلاف للمشروع", type: "image" },
          { name: "liveUrl", label: "رابط حي Demo", type: "url" },
          { name: "githubUrl", label: "رابط مستودع GitHub", type: "url" },
          { name: "isPublished", label: "منشور في الموقع", type: "checkbox" },
          { name: "featured", label: "تمييز المشروع في الرئيسية", type: "checkbox" },
          { name: "caseStudy", label: "دراسة الحالة الكاملة", type: "textarea", rows: 10 },
          { name: "problem", label: "المشكلة المراد حلها", type: "textarea", rows: 4 },
          { name: "solution", label: "الحل البرمجي", type: "textarea", rows: 4 },
          { name: "results", label: "النتائج والمخرجات", type: "textarea", rows: 4 },
          { name: "role", label: "دوري في العمل", type: "text" },
          { name: "seo.metaTitle", label: "SEO Title", placeholder: "عنوان المشروع لمحركات البحث" },
          { name: "seo.metaDescription", label: "SEO Description", type: "textarea", rows: 3, placeholder: "وصف المشروع لمحركات البحث" },
          { name: "seo.ogImage", label: "SEO OgImage", type: "image", placeholder: "صورة المشاركة لمحركات البحث" },
        ],
      }}
    />
  );
}
