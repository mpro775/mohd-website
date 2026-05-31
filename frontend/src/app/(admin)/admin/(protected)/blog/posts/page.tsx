import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminPostsPage() {
  return (
    <AdminResourceManager
      config={{
        title: "إدارة المقالات",
        endpoint: "admin/blog/posts",
        actions: [
          { label: "نشر", path: "publish", method: "PATCH" },
          { label: "إلغاء النشر", path: "unpublish", method: "PATCH" },
          { label: "أرشفة", path: "archive", method: "PATCH" },
        ],
        starter: { title: "", slug: "", summary: "", content: "", status: "draft", category: "", tags: [], allowIndexing: true },
      }}
    />
  );
}
