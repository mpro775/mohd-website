"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { AdminResourceManager } from "@/features/admin/AdminResourceManager";
import { Trash2, ShieldAlert, RefreshCw } from "lucide-react";

type UnusedMediaResponse = {
  total: number;
  items: Array<{
    _id?: string;
    id?: string;
    originalName: string;
    url: string;
    size: number;
    folder: string;
  }>;
  olderThanDays: number;
  estimatedFreedBytes: number;
};

export function MediaAdmin() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [alt, setAlt] = useState("");
  const [folder, setFolder] = useState("misc");

  // Cleanup states
  const [olderThanDays, setOlderThanDays] = useState(7);
  const [unusedMedia, setUnusedMedia] = useState<UnusedMediaResponse | null>(null);
  const [loadingUnused, setLoadingUnused] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);

  async function upload() {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("folder", folder);
    if (alt) formData.set("alt", alt);

    try {
      const response = await fetch("/api/admin-proxy/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error();
      toast.success("تم رفع الملف بنجاح");
      setFile(null);
      setAlt("");
    } catch {
      toast.error("فشل رفع الملف");
    } finally {
      setUploading(false);
    }
  }

  async function checkUnused() {
    setLoadingUnused(true);
    try {
      const response = await fetch(`/api/admin-proxy/admin/media/unused?olderThanDays=${olderThanDays}`);
      if (!response.ok) throw new Error();
      const payload = await response.json();
      setUnusedMedia(payload.data ?? payload);
      toast.success("اكتمل فحص الملفات غير المستخدمة");
    } catch {
      toast.error("فشل جلب قائمة الملفات غير المستخدمة");
    } finally {
      setLoadingUnused(false);
    }
  }

  async function performCleanup() {
    if (!confirm("هل أنت متأكد من رغبتك في حذف كل هذه الملفات غير المستخدمة نهائياً من الخادم والـ Storage؟ لا يمكن التراجع عن هذا الإجراء!")) return;
    setCleaningUp(true);
    try {
      const response = await fetch("/api/admin-proxy/admin/media/cleanup-unused", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          olderThanDays,
          confirm: true
        })
      });
      if (!response.ok) throw new Error();
      toast.success("تم تنظيف وتفريغ المساحة بنجاح!");
      setUnusedMedia(null);
    } catch {
      toast.error("فشل في إكمال عملية التنظيف");
    } finally {
      setCleaningUp(false);
    }
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Upload Block */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="text-xl font-bold">رفع ملف جديد</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">الملف</span>
              <input type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/95" />
            </label>

            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">المجلد</span>
              <select value={folder} onChange={(e) => setFolder(e.target.value)} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none">
                <option value="profile">profile (الملف الشخصي)</option>
                <option value="projects">projects (المشاريع)</option>
                <option value="blog">blog (المدونة)</option>
                <option value="services">services (الخدمات)</option>
                <option value="technologies">technologies (التقنيات)</option>
                <option value="links">links (الروابط)</option>
                <option value="cv">cv (السيرة الذاتية)</option>
                <option value="misc">misc (عام / أخرى)</option>
              </select>
            </label>

            <label className="block space-y-1 md:col-span-2">
              <span className="text-xs text-muted-foreground">النص البديل / Alt Text (اختياري)</span>
              <input type="text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="وصف الصورة لمحركات البحث وقراء الشاشة" className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
            </label>
          </div>
          
          <Button onClick={upload} disabled={!file || uploading} className="w-full flex items-center justify-center gap-2">
            {uploading ? "جاري الرفع وحفظ الملف..." : "حفظ الملف في مكتبة الوسائط"}
          </Button>
        </div>

        {/* Media Cleanup Block */}
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="text-lg font-bold">تنظيف المساحة والملفات</h2>
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              يقوم الباك إند بالتحقق من الملفات التي تم رفعها ولكنها غير مستخدمة في أي مقال، مشروع، بروفايل أو خدمة، ويتيح حذفها نهائياً لتوفير مساحة التخزين.
            </p>

            <label className="block mt-4 space-y-1.5">
              <span className="text-xs text-muted-foreground">أقدم من (أيام) - بحد أدنى 7 أيام:</span>
              <input type="number" min={7} value={olderThanDays} onChange={(e) => setOlderThanDays(Math.max(7, Number(e.target.value)))} className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-red-500/50" />
            </label>
          </div>

          <div className="space-y-2 mt-4">
            <Button variant="secondary" onClick={checkUnused} disabled={loadingUnused} className="w-full border-red-500/30 text-red-300 hover:bg-red-500/10 flex items-center justify-center gap-2 text-xs">
              <RefreshCw className={`h-4 w-4 ${loadingUnused ? "animate-spin" : ""}`} /> فحص الملفات المهملة
            </Button>

            {unusedMedia && (
              <div className="p-3 rounded border border-red-500/20 bg-red-500/10 space-y-2">
                <p className="text-xs text-red-200">
                  تم العثور على: <strong className="text-white">{unusedMedia.total} ملفات مهملة</strong>
                </p>
                <p className="text-xs text-red-200">
                  المساحة القابلة للتحرير: <strong className="text-white">{formatBytes(unusedMedia.estimatedFreedBytes)}</strong>
                </p>
                <Button onClick={performCleanup} disabled={cleaningUp || unusedMedia.total === 0} variant="danger" className="w-full text-xs py-1.5 h-8 flex items-center justify-center gap-2">
                  <Trash2 className="h-4 w-4" /> حذف المساحة المهملة نهائياً
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminResourceManager config={{ title: "مكتبة الوسائط", endpoint: "admin/media", allowCreate: false, fields: [{ name: "alt", label: "النص البديل" }, { name: "folder", label: "المجلد" }, { name: "usage", label: "الاستخدام" }] }} />
    </div>
  );
}
