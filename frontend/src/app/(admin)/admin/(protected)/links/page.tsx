import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminLinksPage() {
  return <AdminResourceManager config={{ title: "إدارة الروابط", endpoint: "admin/links", actions: [{ label: "نشر", path: "publish", method: "PATCH" }, { label: "إلغاء النشر", path: "unpublish", method: "PATCH" }], starter: { title: "", slug: "", url: "https://", category: "social", isPublished: true } }} />;
}
