import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export default function AdminAuditLogsPage() {
  return <AdminResourceManager config={{ title: "سجل التدقيق", endpoint: "admin/audit-logs", allowCreate: false, allowDelete: false }} />;
}
