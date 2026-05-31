import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminTechnologiesPage() {
  return <AdminResourceManager config={{ title: "إدارة التقنيات", endpoint: "admin/technologies", actions: [{ label: "نشر", path: "publish", method: "PATCH" }, { label: "إلغاء النشر", path: "unpublish", method: "PATCH" }], starter: { name: "", slug: "", description: "", category: "frontend", proficiencyLevel: "intermediate", isPublished: true } }} />;
}
