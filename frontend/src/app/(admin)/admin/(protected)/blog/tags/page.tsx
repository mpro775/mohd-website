import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminTagsPage() {
  return (
    <AdminResourceManager
      config={{
        title: "وسوم المدونة",
        endpoint: "admin/blog/tags",
        actions: [
          { label: "تفعيل", path: "activate", method: "PATCH" },
          { label: "تعطيل", path: "deactivate", method: "PATCH" },
        ],
        starter: { name: "", isActive: true },
        fields: [
          { name: "name", label: "اسم الوسم", required: true },
          { name: "isActive", label: "نشط", type: "checkbox" },
        ],
      }}
    />
  );
}
