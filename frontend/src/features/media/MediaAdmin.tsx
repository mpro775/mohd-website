"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { AdminResourceManager } from "@/features/admin/AdminResourceManager";

export function MediaAdmin() {
  const [file, setFile] = useState<File | null>(null);

  async function upload() {
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", file.type.includes("pdf") ? "cv" : "misc");
    const response = await fetch("/api/admin-proxy/admin/media/upload", { method: "POST", body: formData });
    if (!response.ok) {
      toast.error("فشل الرفع");
      return;
    }
    toast.success("تم رفع الملف");
    setFile(null);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4">
        <h1 className="mb-3 text-2xl font-bold">الوسائط</h1>
        <div className="flex flex-wrap gap-3">
          <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <Button onClick={upload} disabled={!file}>رفع</Button>
        </div>
      </div>
      <AdminResourceManager config={{ title: "مكتبة الوسائط", endpoint: "admin/media", allowCreate: false }} />
    </div>
  );
}
