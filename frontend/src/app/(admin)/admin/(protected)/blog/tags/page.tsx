import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminTagsPage() {
  return <AdminResourceManager config={{ title: "وسوم المدونة", endpoint: "admin/blog/tags", actions: [{ label: "تفعيل", path: "activate", method: "PATCH" }, { label: "تعطيل", path: "deactivate", method: "PATCH" }], starter: { name: "", slug: "", description: "", color: "#37d399", isActive: true }, fields: [{ name: "name", label: "الاسم", required: true }, { name: "slug", label: "الرابط" }, { name: "description", label: "الوصف", type: "textarea" }, { name: "color", label: "اللون" }, { name: "isActive", label: "نشط", type: "checkbox" }] }} />;
}
