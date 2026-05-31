import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminContactPage() {
  return <AdminResourceManager config={{ title: "رسائل التواصل", endpoint: "admin/contact/messages", allowCreate: false, actions: [{ label: "تحديث الحالة", path: "status", method: "PATCH" }] }} />;
}
