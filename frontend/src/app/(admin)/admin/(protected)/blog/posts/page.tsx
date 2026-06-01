import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminPostsPage() {
  return (
    <AdminResourceManager
      config={{
        title: "إدارة المقالات",
        endpoint: "admin/blog/posts",
        actions: [
          { label: "نشر", path: "publish", method: "PATCH" },
          { label: "إلغاء النشر", path: "unpublish", method: "PATCH" },
          { label: "أرشفة", path: "archive", method: "PATCH" },
        ],
        starter: { title: "", slug: "", summary: "", content: "", status: "draft", category: "", tags: [], allowIndexing: true, isFeatured: false },
        fields: [
          { name: "title", label: "العنوان", required: true },
          { name: "slug", label: "الرابط الفريد (اتركه فارغاً للتوليد التلقائي)" },
          { name: "summary", label: "الملخص القصير (أكثر من 20 حرف)", type: "textarea", required: true, rows: 3 },
          { name: "excerpt", label: "مقتطف سريع (اختياري)", type: "textarea", rows: 2 },
          { name: "content", label: "المحتوى الكامل (Markdown)", type: "textarea", required: true, rows: 12 },
          { name: "category", label: "التصنيف", type: "select", optionsEndpoint: "admin/blog/categories", required: true },
          { name: "tags", label: "الوسوم", type: "multiselect", optionsEndpoint: "admin/blog/tags" },
          { name: "status", label: "الحالة", type: "select", options: [{ label: "مسودة", value: "draft" }, { label: "منشور", value: "published" }, { label: "مجدول", value: "scheduled" }, { label: "مؤرشف", value: "archived" }] },
          { name: "featuredImage", label: "الصورة البارزة للمقال", type: "image" },
          { name: "coverImage", label: "صورة الغلاف للمقال", type: "image" },
          { name: "publishDate", label: "تاريخ النشر المباشر", type: "date" },
          { name: "scheduledAt", label: "تاريخ الجدولة (للمجدول)", type: "date" },
          { name: "readTime", label: "وقت القراءة (بالدقائق)", type: "number" },
          { name: "isFeatured", label: "تمييز المقال في المدونة", type: "checkbox" },
          { name: "allowIndexing", label: "السماح بفهرسة الصفحة SEO", type: "checkbox" },
          { name: "canonicalUrl", label: "رابط Canonical URL الصالح", type: "url" },
          { name: "seo.metaTitle", label: "SEO Title", placeholder: "عنوان المقال لمحركات البحث" },
          { name: "seo.metaDescription", label: "SEO Description", type: "textarea", rows: 3, placeholder: "وصف المقال لمحركات البحث" },
          { name: "seo.ogImage", label: "SEO OgImage", type: "image", placeholder: "صورة المشاركة لمحركات البحث" },
        ],
      }}
    />
  );
}
