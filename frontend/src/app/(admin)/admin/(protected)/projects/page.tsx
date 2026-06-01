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
        starter: { title: "", slug: "", shortDescription: "", detailedDescription: "", category: "web", technologies: [], isPublished: false },
        fields: [
          { name: "title", label: "العنوان", required: true },
          { name: "slug", label: "الرابط" },
          { name: "category", label: "التصنيف", required: true },
          { name: "status", label: "الحالة", type: "select", options: [{ label: "مكتمل", value: "completed" }, { label: "قيد التنفيذ", value: "in-progress" }, { label: "متوقف", value: "paused" }] },
          { name: "shortDescription", label: "وصف قصير", type: "textarea", required: true, rows: 3 },
          { name: "detailedDescription", label: "وصف تفصيلي", type: "textarea", required: true },
          { name: "technologies", label: "التقنيات", type: "array" },
          { name: "coverImage", label: "صورة الغلاف", type: "url" },
          { name: "liveUrl", label: "رابط مباشر", type: "url" },
          { name: "githubUrl", label: "GitHub", type: "url" },
          { name: "isPublished", label: "منشور", type: "checkbox" },
          { name: "featured", label: "مميز", type: "checkbox" },
          { name: "problem", label: "المشكلة", type: "textarea" },
          { name: "solution", label: "الحل", type: "textarea" },
          { name: "results", label: "النتائج", type: "textarea" },
        ],
      }}
    />
  );
}
