import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminLinksPage() {
  return (
    <AdminResourceManager
      config={{
        title: "إدارة الروابط",
        endpoint: "admin/links",
        actions: [
          { label: "نشر", path: "publish", method: "PATCH" },
          { label: "إلغاء النشر", path: "unpublish", method: "PATCH" },
        ],
        starter: { title: "", slug: "", url: "https://", category: "social", isPublished: true, isFeatured: false },
        fields: [
          { name: "title", label: "العنوان / الاسم", required: true },
          { name: "slug", label: "الرابط الفريد (اتركه فارغاً للتوليد التلقائي)" },
          { name: "url", label: "الرابط الكامل URL", type: "url", required: true },
          { name: "description", label: "الوصف المبسط", type: "textarea", rows: 3 },
          { name: "icon", label: "أيقونة الرابط المخصصة", type: "image" },
          { name: "platform", label: "المنصة (مثال: github, twitter)" },
          { name: "category", label: "التصنيف (مثال: social, resource)" },
          { name: "openInNewTab", label: "فتح في لسان جديد", type: "checkbox" },
          { name: "isFeatured", label: "تمييز الرابط", type: "checkbox" },
          { name: "isPublished", label: "منشور ومتاح", type: "checkbox" },
        ],
      }}
    />
  );
}
