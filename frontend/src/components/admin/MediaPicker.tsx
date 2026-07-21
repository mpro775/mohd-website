"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { EmptyState, LoadingSkeleton } from "@/components/common/State";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Search,
  Upload,
  X,
} from "lucide-react";

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

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type MediaPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (item: MediaItem) => void;
  onSelectMultiple?: (items: MediaItem[]) => void;
  allowMultiple?: boolean;
  allowedType?: "image" | "document" | "all";
  defaultFolder?: string;
};

const EMPTY_META: PaginationMeta = {
  total: 0,
  page: 1,
  limit: 24,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  allowMultiple = false,
  allowedType = "all",
  defaultFolder = "misc",
}: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [folder, setFolder] = useState(defaultFolder);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(24);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFolder(defaultFolder);
    setPage(1);
    setSelectedItems([]);
  }, [isOpen, defaultFolder, allowedType]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (debouncedSearch) query.set("search", debouncedSearch);
      if (allowedType !== "all") query.set("type", allowedType);

      const response = await fetch(`/api/admin-proxy/admin/media?${query.toString()}`);
      if (!response.ok) throw new Error();

      const payload = await response.json();
      const responseItems = payload.data?.items ?? payload.data ?? [];
      const responseMeta = payload.meta ?? payload.data?.meta;

      setItems(Array.isArray(responseItems) ? responseItems : []);
      setMeta({
        total: Number(responseMeta?.total ?? 0),
        page: Number(responseMeta?.page ?? page),
        limit: Number(responseMeta?.limit ?? limit),
        totalPages: Number(responseMeta?.totalPages ?? 0),
        hasNextPage: Boolean(responseMeta?.hasNextPage),
        hasPreviousPage: Boolean(responseMeta?.hasPreviousPage),
      });
    } catch {
      setItems([]);
      setMeta({ ...EMPTY_META, limit });
      toast.error("تعذر تحميل مكتبة الوسائط");
    } finally {
      setLoading(false);
    }
  }, [allowedType, debouncedSearch, limit, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) void load();
  }, [isOpen, load]);

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

      if (page === 1) {
        await load();
      } else {
        setPage(1);
      }
    } catch {
      toast.error("فشل رفع الملف. الرجاء التأكد من الصيغة والحجم.");
    } finally {
      setUploading(false);
    }
  }

  const handleItemClick = (item: MediaItem) => {
    if (allowMultiple) {
      setSelectedItems((prev) => {
        const isSelected = prev.some((i) => (i._id || i.id) === (item._id || item.id));
        if (isSelected) {
          return prev.filter((i) => (i._id || i.id) !== (item._id || item.id));
        } else {
          return [...prev, item];
        }
      });
    } else {
      if (onSelect) onSelect(item);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-5xl flex-col rounded-lg border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-lg font-bold">مكتبة الوسائط</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              إجمالي الملفات المتاحة: {meta.total}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[280px_1fr]">
          {/* Sidebar Upload Form */}
          <div className="space-y-4 overflow-y-auto border-b border-border p-4 md:border-b-0 md:border-l">
            <h3 className="text-sm font-semibold">رفع ملف جديد</h3>
            <div className="rounded-lg border border-dashed border-border p-4 text-center">
              <input
                type="file"
                id="picker-file"
                className="hidden"
                onChange={(event) => {
                  const selected = event.target.files?.[0] ?? null;
                  setFile(selected);
                  if (selected) {
                    if (selected.type.includes("pdf")) setFolder("cv");
                    else if (selected.type.startsWith("image/")) {
                      if (defaultFolder && defaultFolder !== "misc" && defaultFolder !== "cv") {
                        setFolder(defaultFolder);
                      } else {
                        setFolder("misc");
                      }
                    }
                  }
                }}
              />
              <label htmlFor="picker-file" className="block cursor-pointer space-y-2">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <span className="block text-xs font-semibold text-primary">اختر ملفاً</span>
                <span className="block text-[10px] text-muted-foreground">أقصى حجم: 5MB</span>
              </label>
            </div>

            {file && (
              <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
                <p className="truncate text-xs font-semibold text-foreground" dir="ltr">
                  {file.name}
                </p>

                <label className="block">
                  <span className="mb-1 block text-[11px] text-muted-foreground">المجلد</span>
                  <select
                    value={folder}
                    onChange={(event) => setFolder(event.target.value)}
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs outline-none"
                  >
                    <option value="profile">profile (الملف الشخصي)</option>
                    <option value="projects">projects (المشاريع)</option>
                    <option value="blog">blog (المدونة)</option>
                    <option value="services">services (الخدمات)</option>
                    <option value="technologies">technologies (التقنيات)</option>
                    <option value="certifications">certifications (الشهادات المهنية)</option>
                    <option value="education">education (المؤهلات الأكاديمية)</option>
                    <option value="links">links (الروابط)</option>
                    <option value="cv">cv (السيرة الذاتية)</option>
                    <option value="misc">misc (عام / أخرى)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-[11px] text-muted-foreground">
                    الوصف / النص البديل Alt
                  </span>
                  <input
                    type="text"
                    value={alt}
                    onChange={(event) => setAlt(event.target.value)}
                    placeholder="وصف الصورة لمحركات البحث"
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
                  />
                </label>

                <Button onClick={handleUpload} disabled={uploading} className="h-8 w-full text-xs">
                  {uploading ? "جاري الرفع..." : "رفع وحفظ"}
                </Button>
              </div>
            )}
          </div>

          {/* Media Grid */}
          <div className="flex min-h-0 flex-col gap-4 overflow-hidden p-4">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث في جميع الملفات بالاسم أو النص البديل..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-md border border-border bg-background py-2 pr-9 pl-4 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loading ? (
                <LoadingSkeleton className="h-full" />
              ) : items.length === 0 ? (
                <EmptyState title="لا توجد ملفات متطابقة" />
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {items.map((item) => {
                    const isImage = item.mimeType.startsWith("image/");
                    const isSelected =
                      allowMultiple &&
                      selectedItems.some((i) => (i._id || i.id) === (item._id || item.id));
                    return (
                      <div
                        key={item._id ?? item.id}
                        className={`group relative cursor-pointer overflow-hidden rounded-lg border transition ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/50 bg-primary/5"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="relative flex aspect-square items-center justify-center bg-muted/40">
                          {isImage ? (
                            <img
                              src={item.url}
                              alt={item.alt ?? ""}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <div className="border-t border-border bg-card/90 p-2">
                          <p className="truncate text-xs font-semibold" dir="ltr">
                            {item.originalName}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">{item.folder}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {allowMultiple && (
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs font-bold text-muted-foreground">
                  {selectedItems.length} ملفات محددة
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (onSelectMultiple) onSelectMultiple(selectedItems);
                      setSelectedItems([]);
                    }}
                    disabled={selectedItems.length === 0}
                    className="h-8 px-4 text-xs"
                  >
                    إدراج المحدد
                  </Button>
                </div>
              </div>
            )}

            {/* Server-side pagination */}
            <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>عرض:</span>
                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-8 rounded-md border border-border bg-background px-2 outline-none"
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                  <option value={96}>96</option>
                </select>
                <span>ملفاً في الصفحة</span>
              </div>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <span className="text-xs font-semibold text-foreground">
                  الصفحة {meta.totalPages === 0 ? 0 : meta.page} من {meta.totalPages}
                </span>

                <div className="flex items-center gap-1" dir="rtl">
                  <button
                    type="button"
                    onClick={() => setPage(1)}
                    disabled={!meta.hasPreviousPage || loading}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    title="الصفحة الأولى"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={!meta.hasPreviousPage || loading}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    title="الصفحة السابقة"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.min(meta.totalPages, current + 1))}
                    disabled={!meta.hasNextPage || loading}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    title="الصفحة التالية"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage(meta.totalPages)}
                    disabled={!meta.hasNextPage || loading}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                    title="الصفحة الأخيرة"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
