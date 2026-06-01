import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminFaqsPage() {
  return (
    <AdminResourceManager
      config={{
        title: "إدارة FAQ",
        endpoint: "admin/faqs",
        actions: [
          { label: "نشر", path: "publish", method: "PATCH" },
          { label: "إلغاء النشر", path: "unpublish", method: "PATCH" },
        ],
        starter: { question: "", answer: "", category: "general", isPublished: true, isFeatured: false },
        fields: [
          { name: "question", label: "السؤال الفعلي", required: true },
          { name: "answer", label: "الإجابة الكاملة", type: "textarea", required: true, rows: 4 },
          { name: "category", label: "التصنيف (مثال: general, technical)" },
          { name: "order", label: "ترتيب الظهور", type: "number" },
          { name: "isFeatured", label: "السؤال مميز في الصفحة الرئيسية", type: "checkbox" },
          { name: "isPublished", label: "منشور ومرئي للزوار", type: "checkbox" },
          { name: "seo.metaTitle", label: "عنوان SEO", placeholder: "عنوان السؤال لمحركات البحث" },
          { name: "seo.metaDescription", label: "وصف SEO", type: "textarea", rows: 3, placeholder: "وصف الإجابة لمحركات البحث" },
        ],
      }}
    />
  );
}
