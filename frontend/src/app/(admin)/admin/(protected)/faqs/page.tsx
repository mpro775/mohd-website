import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminFaqsPage() {
  return <AdminResourceManager config={{ title: "إدارة FAQ", endpoint: "admin/faqs", actions: [{ label: "نشر", path: "publish", method: "PATCH" }, { label: "إلغاء النشر", path: "unpublish", method: "PATCH" }], starter: { question: "", answer: "", category: "general", isPublished: false }, fields: [{ name: "question", label: "السؤال", required: true }, { name: "answer", label: "الإجابة", type: "textarea", required: true }, { name: "category", label: "التصنيف" }, { name: "order", label: "الترتيب", type: "number" }, { name: "isFeatured", label: "مميز", type: "checkbox" }, { name: "isPublished", label: "منشور", type: "checkbox" }] }} />;
}
