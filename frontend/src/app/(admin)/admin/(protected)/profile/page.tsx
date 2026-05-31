import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminProfilePage() {
  return <AdminResourceManager config={{ title: "الملف الشخصي", endpoint: "admin/profile", allowCreate: false, allowDelete: false, fields: [{ name: "fullName", label: "الاسم الكامل", required: true }, { name: "title", label: "المسمى", required: true }, { name: "headline", label: "العنوان المختصر" }, { name: "bio", label: "نبذة", type: "textarea", required: true }, { name: "about", label: "عنّي", type: "textarea" }, { name: "email", label: "البريد" }, { name: "phone", label: "الهاتف" }, { name: "location", label: "الموقع" }, { name: "profileImage", label: "صورة الملف", type: "url" }, { name: "cvFile", label: "ملف CV", type: "url" }, { name: "yearsOfExperience", label: "سنوات الخبرة", type: "number" }, { name: "availableForWork", label: "متاح للعمل", type: "checkbox" }] }} />;
}
