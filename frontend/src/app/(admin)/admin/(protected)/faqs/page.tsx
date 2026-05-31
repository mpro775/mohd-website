import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminFaqsPage() {
  return <AdminResourceManager config={{ title: "إدارة FAQ", endpoint: "admin/faqs", actions: [{ label: "نشر", path: "publish", method: "PATCH" }, { label: "إلغاء النشر", path: "unpublish", method: "PATCH" }], starter: { question: "", answer: "", category: "general", isPublished: false } }} />;
}
