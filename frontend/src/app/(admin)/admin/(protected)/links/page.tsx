import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminLinksPage() {
  return <AdminResourceManager config={{ title: "إدارة الروابط", endpoint: "admin/links", actions: [{ label: "نشر", path: "publish", method: "PATCH" }, { label: "إلغاء النشر", path: "unpublish", method: "PATCH" }], starter: { title: "", slug: "", url: "https://", category: "social", isPublished: true }, fields: [{ name: "title", label: "العنوان", required: true }, { name: "slug", label: "الرابط" }, { name: "url", label: "URL", type: "url", required: true }, { name: "description", label: "الوصف", type: "textarea" }, { name: "platform", label: "المنصة" }, { name: "category", label: "التصنيف" }, { name: "openInNewTab", label: "فتح في نافذة جديدة", type: "checkbox" }, { name: "isFeatured", label: "مميز", type: "checkbox" }, { name: "isPublished", label: "منشور", type: "checkbox" }] }} />;
}
