import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminCategoriesPage() {
  return <AdminResourceManager config={{ title: "تصنيفات المدونة", endpoint: "admin/blog/categories", actions: [{ label: "تفعيل", path: "activate", method: "PATCH" }, { label: "تعطيل", path: "deactivate", method: "PATCH" }], starter: { name: "", slug: "", description: "", isActive: true }, fields: [{ name: "name", label: "الاسم", required: true }, { name: "slug", label: "الرابط" }, { name: "description", label: "الوصف", type: "textarea" }, { name: "isActive", label: "نشط", type: "checkbox" }] }} />;
}
