import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminServicesPage() {
  return <AdminResourceManager config={{ title: "إدارة الخدمات", endpoint: "admin/services", actions: [{ label: "نشر", path: "publish", method: "PATCH" }, { label: "إلغاء النشر", path: "unpublish", method: "PATCH" }], starter: { name: "", slug: "", shortDescription: "", detailedDescription: "", deliverables: [], requirements: [], isPublished: false } }} />;
}
