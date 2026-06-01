import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminProfilePage() {
  return (
    <AdminResourceManager
      config={{
        title: "الملف الشخصي",
        endpoint: "admin/profile",
        allowCreate: false,
        allowDelete: false,
        noId: true,
        fields: [
          { name: "fullName", label: "الاسم الكامل", required: true },
          { name: "title", label: "المسمى الوظيفي", required: true },
          { name: "headline", label: "العنوان المختصر" },
          { name: "bio", label: "السيرة المختصرة", type: "textarea", required: true, rows: 3 },
          { name: "about", label: "السيرة الطويلة (عنّي)", type: "textarea", rows: 10 },
          { name: "email", label: "البريد الإلكتروني", required: true },
          { name: "phone", label: "رقم الهاتف" },
          { name: "location", label: "الموقع الجغرافي" },
          { name: "profileImage", label: "الصورة الشخصية", type: "image" },
          { name: "cvFile", label: "ملف السيرة الذاتية (CV)", type: "file" },
          { name: "yearsOfExperience", label: "سنوات الخبرة", type: "number" },
          { name: "availableForWork", label: "متاح للعمل حالياً", type: "checkbox" },
          { name: "seo.metaTitle", label: "عنوان SEO", placeholder: "عنوان الصفحة لمحركات البحث" },
          { name: "seo.metaDescription", label: "وصف SEO", type: "textarea", rows: 3, placeholder: "وصف الصفحة لمحركات البحث" },
          { name: "seo.ogImage", label: "صورة Open Graph (SEO)", type: "image", placeholder: "صورة المشاركة لمواقع التواصل الاجتماعي" },
        ],
      }}
    />
  );
}
