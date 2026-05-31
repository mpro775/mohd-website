import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminContactPage() {
  return <AdminResourceManager config={{ title: "رسائل التواصل", endpoint: "admin/contact/messages", allowCreate: false, allowDelete: false, allowEdit: false, actions: [{ label: "تمت القراءة", path: "status", method: "PATCH", body: { status: "read" } }, { label: "تم الرد", path: "status", method: "PATCH", body: { status: "replied" } }] }} />;
}
