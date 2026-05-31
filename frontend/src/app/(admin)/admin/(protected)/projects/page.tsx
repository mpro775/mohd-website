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
      }}
    />
  );
}
