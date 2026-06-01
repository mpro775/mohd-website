"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { EmptyState, LoadingSkeleton } from "@/components/common/State";
import { FileText, Search, Upload, X } from "lucide-react";

type MediaItem = {
  id?: string;
  _id?: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  folder: string;
  type: "image" | "document";
  alt?: string;
};

type MediaPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  allowedType?: "image" | "document" | "all";
};

export function MediaPicker({ isOpen, onClose, onSelect, allowedType = "all" }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [folder, setFolder] = useState("uploads");
  const [searchTerm, setSearchTerm] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin-proxy/admin/media");
      if (!response.ok) throw new Error();
      const payload = await response.json();
      let data = payload.data?.items ?? payload.data ?? [];
      if (!Array.isArray(data)) data = [];
      setItems(data);
    } catch {
      toast.error("تعذر تحميل مكتبة الوسائط");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load();
    }
  }, [isOpen]);

  async function handleUpload() {
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
      toast.success("تم الرفع بنجاح");
      setFile(null);
      setAlt("");
      await load();
    } catch {
      toast.error("فشل رفع الملف. الرجاء التأكد من الصيغة والحجم.");
    } finally {
      setUploading(false);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.originalName.toLowerCase().includes(searchTerm.toLowerCase()) || (item.alt ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      allowedType === "all" ||
      (allowedType === "image" && item.mimeType.startsWith("image/")) ||
      (allowedType === "document" && !item.mimeType.startsWith("image/"));
    return matchesSearch && matchesType;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-lg border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-bold">مكتبة الوسائط</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[280px_1fr]">
          {/* Sidebar Upload Form */}
          <div className="border-b border-border p-4 space-y-4 md:border-b-0 md:border-l">
            <h3 className="font-semibold text-sm">رفع ملف جديد</h3>
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <input
                type="file"
                id="picker-file"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  setFile(selected);
                  if (selected) {
                    // Auto detect folder
                    if (selected.type.includes("pdf")) setFolder("cv");
                    else if (selected.type.startsWith("image/")) setFolder("images");
                  }
                }}
              />
              <label htmlFor="picker-file" className="cursor-pointer space-y-2 block">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <span className="block text-xs font-semibold text-primary">اختر ملفاً</span>
                <span className="block text-[10px] text-muted-foreground">أقصى حجم: 5MB</span>
              </label>
            </div>

            {file && (
              <div className="space-y-3 bg-muted/40 p-3 rounded-lg border border-border">
                <p className="truncate text-xs font-semibold text-foreground" dir="ltr">{file.name}</p>
                
                <label className="block">
                  <span className="block text-[11px] text-muted-foreground mb-1">المجلد</span>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs outline-none"
                  >
                    <option value="images">images (الصور)</option>
                    <option value="cv">cv (السيرة الذاتية)</option>
                    <option value="posts">posts (المقالات)</option>
                    <option value="projects">projects (المشاريع)</option>
                    <option value="uploads">uploads (عام)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="block text-[11px] text-muted-foreground mb-1">الوصف / النص البديل Alt</span>
                  <input
                    type="text"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="وصف الصورة لمحركات البحث"
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                  />
                </label>

                <Button onClick={handleUpload} disabled={uploading} className="w-full text-xs h-8">
                  {uploading ? "جاري الرفع..." : "رفع وحفظ"}
                </Button>
              </div>
            )}
          </div>

          {/* Media Grid */}
          <div className="flex flex-col overflow-hidden p-4 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث بالاسم أو النص البديل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-border bg-background py-2 pr-9 pl-4 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <LoadingSkeleton className="h-full" />
              ) : filteredItems.length === 0 ? (
                <EmptyState title="لا توجد ملفات متطابقة" />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {filteredItems.map((item) => {
                    const isImage = item.mimeType.startsWith("image/");
                    return (
                      <div
                        key={item._id ?? item.id}
                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition hover:border-primary/50"
                        onClick={() => onSelect(item.url)}
                      >
                        <div className="aspect-square relative flex items-center justify-center bg-muted/40">
                          {isImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.url} alt={item.alt ?? ""} className="h-full w-full object-cover" />
                          ) : (
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <div className="p-2 border-t border-border bg-card/90">
                          <p className="truncate text-xs font-semibold" dir="ltr">{item.originalName}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.folder}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
