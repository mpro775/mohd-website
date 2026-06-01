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
        starter: { title: "", slug: "", summary: "", content: "", status: "draft", category: "", tags: [], allowIndexing: true },
        fields: [
          { name: "title", label: "العنوان", required: true },
          { name: "summary", label: "الملخص", type: "textarea", required: true, rows: 3 },
          { name: "content", label: "المحتوى", type: "textarea", required: true, rows: 10 },
          { name: "category", label: "التصنيف", type: "select", optionsEndpoint: "admin/blog/categories" },
          { name: "tags", label: "الوسوم", type: "multiselect", optionsEndpoint: "admin/blog/tags" },
          { name: "status", label: "الحالة", type: "select", options: [{ label: "مسودة", value: "draft" }, { label: "منشور", value: "published" }, { label: "مجدول", value: "scheduled" }, { label: "مؤرشف", value: "archived" }] },
          { name: "featuredImage", label: "الصورة البارزة", type: "url" },
          { name: "coverImage", label: "صورة الغلاف", type: "url" },
          { name: "publishDate", label: "تاريخ النشر", type: "date" },
          { name: "readTime", label: "وقت القراءة", type: "number" },
          { name: "isFeatured", label: "مميز", type: "checkbox" },
          { name: "allowIndexing", label: "السماح بالأرشفة", type: "checkbox" },
          { name: "canonicalUrl", label: "Canonical URL", type: "url" },
        ],
      }}
    />
  );
}
