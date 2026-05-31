import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminProfilePage() {
  return <AdminResourceManager config={{ title: "الملف الشخصي", endpoint: "admin/profile", allowCreate: false, allowDelete: false }} />;
}
