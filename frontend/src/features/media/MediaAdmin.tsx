"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Trash2,
  ShieldAlert,
  RefreshCw,
  Search,
  Grid,
  List,
  Copy,
  Check,
  Image as ImageIcon,
  FileText,
  Info,
  X,
  HardDrive,
  UploadCloud,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminClient } from "@/lib/api/admin-client";
import { adminQueryKeys } from "@/lib/api/admin-query-keys";
import { handleAdminError } from "@/lib/api/admin-errors";
import { useQueryStates } from "nuqs";
import { adminSearchParamsSchema } from "@/lib/api/admin-search-params";

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
  usage?: string | string[];
};

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

const MEDIA_FILE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,application/pdf";

export function MediaAdmin() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [queryParams, setQueryParams] = useQueryStates(adminSearchParamsSchema);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(queryParams.search || "");

  // Sync query search state to local input value
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(queryParams.search || "");
    }, 0);

    return () => clearTimeout(handler);
  }, [queryParams.search]);

  // Debounce search state updates
  useEffect(() => {
    const handler = setTimeout(() => {
      if ((queryParams.search || "") !== searchTerm) {
        setQueryParams({ search: searchTerm || undefined, page: 1 });
      }
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm, queryParams.search, setQueryParams]);

  // Modal / Dialog States
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editFolder, setEditFolder] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCleanupOpen, setIsCleanupOpen] = useState(false);
  const [editUsage, setEditUsage] = useState("");

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadFolder, setUploadFolder] = useState("misc");
  const [uploadAlt, setUploadAlt] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Cleanup states
  const [olderThanDays, setOlderThanDays] = useState(7);
  const [unusedMedia, setUnusedMedia] = useState<UnusedMediaResponse | null>(
    null,
  );
  const [loadingUnused, setLoadingUnused] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);

  // Folders list
  const folders = [
    { value: "profile", label: "الملف الشخصي (profile)" },
    { value: "projects", label: "المشاريع (projects)" },
    { value: "blog", label: "المدونة (blog)" },
    { value: "services", label: "الخدمات (services)" },
    { value: "technologies", label: "التقنيات (technologies)" },
    { value: "certifications", label: "الشهادات المهنية (certifications)" },
    { value: "education", label: "المؤهلات الأكاديمية (education)" },
    { value: "links", label: "الروابط (links)" },
    { value: "cv", label: "السيرة الذاتية (cv)" },
    { value: "misc", label: "عام / أخرى (misc)" },
  ];

  // 1. Fetch Media List using React Query
  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: adminQueryKeys.resource("media", queryParams),
    queryFn: () =>
      adminClient.listResource<MediaItem>("media", {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
        folder: queryParams.folder === "all" ? undefined : queryParams.folder,
        type: queryParams.type === "all" ? undefined : queryParams.type,
        isUsed:
          queryParams.isUsed === "used"
            ? true
            : queryParams.isUsed === "unused"
              ? false
              : undefined,
        sortBy: queryParams.sortBy || "createdAt",
        sortOrder: queryParams.sortOrder || "desc",
      }),
  });

  const mediaItems = data?.items || [];
  const meta = data?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // 2. Mutations
  const invalidateKeys = () => {
    queryClient.invalidateQueries({
      queryKey: adminQueryKeys.resource("media"),
    });
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() });
  };

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (uploadFiles.length === 0) return;
      const promises = uploadFiles.map((file) =>
        adminClient.uploadMedia<MediaItem>(
          file,
          uploadFolder,
          uploadAlt || undefined,
        ),
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success(`تم رفع وحفظ ${uploadFiles.length} ملفات بنجاح!`);
      setUploadFiles([]);
      setUploadAlt("");
      invalidateKeys();
    },
    onError: (err) => {
      handleAdminError(err, "فشل رفع الملف. الرجاء التأكد من الصيغة والحجم.");
    },
  });

  // Update Alt/Folder Mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      alt,
      folder,
      usage,
    }: {
      id: string;
      alt: string;
      folder: string;
      usage?: string;
    }) => {
      return adminClient.patchResource<MediaItem>("media", id, {
        alt,
        folder,
        usage,
      });
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || "تم تحديث بيانات الملف بنجاح!");
      setSelectedItem(null);
      invalidateKeys();
    },
    onError: (err) => {
      handleAdminError(err, "فشل تعديل بيانات الملف.");
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminClient.deleteResource("media", id);
    },
    onSuccess: () => {
      toast.success("تم حذف الملف نهائياً بنجاح");
      setDeletingId(null);
      setSelectedItem(null);
      invalidateKeys();
    },
    onError: (err) => {
      handleAdminError(err, "فشل في حذف الملف المهمل");
    },
  });

  // Copy helper
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("تم نسخ رابط الملف إلى الحافظة");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setUploadFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  // Unused Media Functions
  async function checkUnused() {
    setLoadingUnused(true);
    try {
      const response = await fetch(
        `/api/admin-proxy/admin/media/unused?olderThanDays=${olderThanDays}`,
      );
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
    setCleaningUp(true);
    try {
      const response = await fetch(
        "/api/admin-proxy/admin/media/cleanup-unused",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            olderThanDays,
            confirm: true,
          }),
        },
      );
      if (!response.ok) throw new Error();
      toast.success("تم تنظيف وتفريغ المساحة بنجاح!");
      setUnusedMedia(null);
      setIsCleanupOpen(false);
      invalidateKeys();
    } catch {
      toast.error("فشل في إكمال عملية التنظيف");
    } finally {
      setCleaningUp(false);
    }
  }

  // Format Bytes helper
  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Edit details handler
  const handleOpenDetails = (item: MediaItem) => {
    setSelectedItem(item);
    setEditAlt(item.alt || "");
    setEditFolder(item.folder || "misc");
    setEditUsage(
      typeof item.usage === "string"
        ? item.usage
        : Array.isArray(item.usage)
          ? item.usage.join(", ")
          : "",
    );
  };

  const handleSaveDetails = () => {
    if (!selectedItem) return;
    const id = selectedItem.id ?? selectedItem._id ?? "";
    updateMutation.mutate({
      id,
      alt: editAlt,
      folder: editFolder,
      usage: editUsage || undefined,
    });
  };

  // Filtering is handled server-side via queryParams

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">
            مكتبة الوسائط
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            قم برفع الصور والملفات وتصنيفها، ونسخ روابط التضمين بشكل آمن ومحسّن
            لمحركات البحث.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => setIsCleanupOpen(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 text-xs font-bold text-red-400 hover:bg-red-500/10 cursor-pointer transition select-none shadow-sm"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>تنظيف المساحة المهملة</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Upload & Library */}
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Right side: Dropzone and Settings */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-foreground">رفع ملف جديد</h2>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[140px] ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[0.98]"
                  : uploadFiles.length > 0
                    ? "border-green-500/40 bg-green-500/5 hover:bg-green-500/10"
                    : "border-border hover:border-primary/50 hover:bg-muted/10"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={MEDIA_FILE_ACCEPT}
                onChange={(e) => {
                  if (e.target.files) {
                    setUploadFiles((prev) => [
                      ...prev,
                      ...Array.from(e.target.files!),
                    ]);
                  }
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="hidden"
              />

              {uploadFiles.length > 0 ? (
                <div
                  className="space-y-2 max-h-[200px] overflow-y-auto w-full px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-xs font-bold mb-2 text-foreground">
                    تم تحديد {uploadFiles.length} ملفات:
                  </div>
                  {uploadFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-background/50 p-2 rounded border border-border"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="h-6 w-6 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="h-3.5 w-3.5" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <p
                          className="text-[10px] font-bold truncate text-foreground max-w-[120px]"
                          dir="ltr"
                        >
                          {file.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[9px] text-muted-foreground">
                          {formatBytes(file.size)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadFiles((prev) =>
                              prev.filter((_, i) => i !== idx),
                            );
                          }}
                          className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-center gap-3 border-t border-border mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFiles([]);
                      }}
                      className="text-[10px] font-semibold text-red-400 hover:text-red-300 underline cursor-pointer"
                    >
                      إلغاء الكل
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-[10px] font-semibold text-primary hover:text-primary/80 underline cursor-pointer"
                    >
                      إضافة المزيد
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-foreground font-semibold">
                    اسحب وألقِ الملف هنا، أو انقر للتصفح
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    JPEG/PNG/WebP حتى 5MB · الصور المتحركة حتى 15MB · PDF حتى
                    10MB
                  </p>
                </div>
              )}
            </div>

            {/* Folder Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">
                مجلد الحفظ
              </label>
              <select
                value={uploadFolder}
                onChange={(e) => setUploadFolder(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary transition"
              >
                {folders.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Alt Text Description */}
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-semibold">
                النص البديل لمحرّكات البحث (Alt Text)
              </label>
              <input
                type="text"
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                placeholder="مثال: شعار الشركة باللون الأزرق"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary transition"
              />
            </div>

            {/* Submit Button */}
            <Button
              onClick={() => uploadMutation.mutate()}
              disabled={uploadFiles.length === 0 || uploadMutation.isPending}
              className="w-full text-xs font-bold py-2 flex items-center justify-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>جاري رفع وحفظ الملف...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>حفظ الملف في مكتبة الوسائط</span>
                </>
              )}
            </Button>
          </div>

          {/* Quick Storage Stats */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5" />
              <span>إحصائيات مكتبة الوسائط</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="rounded-lg bg-muted/30 border border-border p-3 text-center">
                <span className="text-[10px] text-muted-foreground block font-semibold">
                  إجمالي الملفات
                </span>
                <span className="text-lg font-bold text-foreground mt-0.5 block">
                  {meta.total}
                </span>
              </div>
              <div className="rounded-lg bg-muted/30 border border-border p-3 text-center">
                <span className="text-[10px] text-muted-foreground block font-semibold">
                  حجم الصفحة الحالية
                </span>
                <span className="text-xs font-bold text-foreground mt-1.5 block">
                  {formatBytes(
                    mediaItems.reduce((acc, curr) => acc + (curr.size || 0), 0),
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Left side: Search, Filters and Gallery Grid */}
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap flex-1 items-center gap-2 min-w-[240px]">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="ابحث باسم الملف أو النص البديل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-3 pr-9 text-xs outline-none focus:border-primary transition"
                />
              </div>

              <select
                value={queryParams.folder || "all"}
                onChange={(e) =>
                  setQueryParams({
                    folder:
                      e.target.value === "all" ? undefined : e.target.value,
                    page: 1,
                  })
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary transition font-semibold"
              >
                <option value="all">كل المجلدات</option>
                {folders.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.value}
                  </option>
                ))}
              </select>

              <select
                value={queryParams.type || "all"}
                onChange={(e) =>
                  setQueryParams({
                    type: e.target.value === "all" ? undefined : e.target.value,
                    page: 1,
                  })
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary transition font-semibold"
              >
                <option value="all">كل الأنواع</option>
                <option value="image">صور</option>
                <option value="document">مستندات</option>
              </select>

              <select
                value={queryParams.isUsed || "all"}
                onChange={(e) =>
                  setQueryParams({
                    isUsed:
                      e.target.value === "all" ? undefined : e.target.value,
                    page: 1,
                  })
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary transition font-semibold"
              >
                <option value="all">كل الملفات (مستعمل/مهمل)</option>
                <option value="used">مستعمل فقط</option>
                <option value="unused">غير مستعمل فقط</option>
              </select>
              <select
                value={queryParams.sortBy || "createdAt"}
                onChange={(e) =>
                  setQueryParams({ sortBy: e.target.value, page: 1 })
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary transition font-semibold"
              >
                <option value="createdAt">الأحدث إضافة</option>
                <option value="updatedAt">آخر تحديث</option>
                <option value="filename">اسم الملف</option>
                <option value="size">حجم الملف</option>
                <option value="mimeType">نوع MIME</option>
                <option value="folder">المجلد</option>
                <option value="type">النوع</option>
              </select>

              <select
                value={queryParams.sortOrder || "desc"}
                onChange={(e) =>
                  setQueryParams({ sortOrder: e.target.value, page: 1 })
                }
                className="rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary transition font-semibold"
              >
                <option value="desc">تنازلي</option>
                <option value="asc">تصاعدي</option>
              </select>
            </div>

            {/* View Mode and Stats */}
            <div className="flex items-center gap-2 border-r border-border pr-3">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="عرض شبكي"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition cursor-pointer ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                title="عرض قائمة"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Loader */}
          {isLoading ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-3 text-xs text-muted-foreground font-semibold">
                جاري جلب ملفات الوسائط...
              </p>
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                لم يتم العثور على أية ملفات وسائط
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                لم نجد أية ملفات تطابق معايير البحث والفرز الحالية. يمكنك تعديل
                البحث أو رفع ملف جديد.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            // Grid Gallery View
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mediaItems.map((item) => {
                const isImage =
                  item.mimeType?.startsWith("image/") || item.type === "image";
                return (
                  <div
                    key={item.id ?? item._id}
                    onClick={() => handleOpenDetails(item)}
                    className="group relative rounded-xl border border-border bg-card overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-md transition duration-300"
                  >
                    {/* Media Body */}
                    <div className="aspect-square bg-muted flex items-center justify-center relative overflow-hidden">
                      {isImage ? (
                        <img
                          src={item.url}
                          alt={item.alt || item.originalName}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-500 bg-muted/20"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <FileText className="h-8 w-8 text-primary/70 mx-auto" />
                          <span className="text-[10px] font-bold text-muted-foreground mt-1.5 block uppercase">
                            {item.mimeType?.split("/")[1] || "ملف"}
                          </span>
                        </div>
                      )}

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(item.url);
                          }}
                          className="p-1.5 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition"
                          title="نسخ الرابط"
                        >
                          {copiedUrl === item.url ? (
                            <Check className="h-3.5 w-3.5 text-green-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetails(item);
                          }}
                          className="p-1.5 rounded-lg bg-card border border-border text-foreground hover:bg-muted transition"
                          title="تعديل التفاصيل"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Folder tag */}
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-semibold bg-background/80 backdrop-blur-sm border border-border text-muted-foreground uppercase">
                        {item.folder}
                      </span>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2 border-t border-border bg-card/50">
                      <p
                        className="text-[10px] font-bold truncate text-foreground text-right"
                        dir="ltr"
                      >
                        {item.originalName}
                      </p>
                      <p className="text-[9px] text-muted-foreground mt-0.5 font-medium">
                        {formatBytes(item.size)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View Table
            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
              <table className="w-full min-w-[640px] text-sm text-right">
                <thead className="bg-muted/40 text-muted-foreground text-xs border-b border-border">
                  <tr>
                    <th className="p-3.5 font-bold">الملف</th>
                    <th className="p-3.5 font-bold">المجلد</th>
                    <th className="p-3.5 font-bold">النوع</th>
                    <th className="p-3.5 font-bold">الحجم</th>
                    <th className="p-3.5 font-bold">النص البديل (Alt)</th>
                    <th className="p-3.5 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mediaItems.map((item) => {
                    const isImage =
                      item.mimeType?.startsWith("image/") ||
                      item.type === "image";
                    return (
                      <tr
                        key={item.id ?? item._id}
                        className="hover:bg-muted/10 transition"
                      >
                        <td className="p-3 font-semibold">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                              {isImage ? (
                                <img
                                  src={item.url}
                                  alt={item.alt || ""}
                                  className="h-full w-full object-cover bg-muted/20"
                                />
                              ) : (
                                <FileText className="h-5 w-5 text-primary/70" />
                              )}
                            </div>
                            <div className="truncate max-w-[200px]">
                              <p
                                className="text-xs font-bold text-foreground truncate"
                                dir="ltr"
                              >
                                {item.originalName}
                              </p>
                              <p
                                className="text-[10px] text-muted-foreground font-mono truncate"
                                dir="ltr"
                              >
                                {item.url}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-muted/50 border border-border text-muted-foreground uppercase">
                            {item.folder}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground uppercase font-mono">
                          {item.mimeType?.split("/")[1] || item.type}
                        </td>
                        <td className="p-3 text-xs font-medium text-foreground">
                          {formatBytes(item.size)}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground max-w-[150px] truncate">
                          {item.alt || (
                            <span className="italic text-muted-foreground/50">
                              بلا وصف
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleCopyUrl(item.url)}
                              className="p-1 rounded-md border border-border bg-card text-foreground hover:bg-muted transition cursor-pointer"
                              title="نسخ الرابط"
                            >
                              {copiedUrl === item.url ? (
                                <Check className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenDetails(item)}
                              className="p-1 rounded-md border border-border bg-card text-foreground hover:bg-muted transition cursor-pointer"
                              title="تعديل"
                            >
                              <Info className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeletingId(item.id ?? item._id ?? null)
                              }
                              className="p-1 rounded-md border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 transition cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 py-3 select-none border-t border-border mt-6 animate-in fade-in duration-200"
              dir="rtl"
            >
              <div className="flex-1 text-sm text-muted-foreground text-right font-semibold">
                <span>إجمالي الملفات: {meta.total}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 justify-end">
                {/* Page size selector */}
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    عدد العناصر المعروضة:
                  </p>
                  <select
                    value={meta.limit}
                    onChange={(e) =>
                      setQueryParams({ limit: Number(e.target.value), page: 1 })
                    }
                    className="h-8 rounded-lg border border-border bg-card px-2 text-xs font-semibold outline-none focus:border-primary cursor-pointer transition"
                  >
                    {[10, 20, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size} عناصر
                      </option>
                    ))}
                  </select>
                </div>

                {/* Current page indicator */}
                <div
                  className="flex items-center justify-center text-xs font-bold text-foreground"
                  dir="ltr"
                >
                  <span>
                    الصفحة {meta.page} من {meta.totalPages}
                  </span>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setQueryParams({ page: 1 })}
                    disabled={meta.page <= 1}
                    className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition shadow-sm"
                    title="الصفحة الأولى"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setQueryParams({ page: meta.page - 1 })}
                    disabled={meta.page <= 1}
                    className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition shadow-sm"
                    title="الصفحة السابقة"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setQueryParams({ page: meta.page + 1 })}
                    disabled={meta.page >= meta.totalPages}
                    className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition shadow-sm"
                    title="الصفحة التالية"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setQueryParams({ page: meta.totalPages })}
                    disabled={meta.page >= meta.totalPages}
                    className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition shadow-sm"
                    title="الصفحة الأخيرة"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details modal for single item folder/alt edits */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-border bg-card/95 backdrop-blur-md max-w-lg w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="text-sm font-bold text-foreground">
                تفاصيل وبيانات الملف
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Media Preview Box */}
              <div className="rounded-lg border border-border bg-muted/30 aspect-video flex items-center justify-center overflow-hidden">
                {selectedItem.mimeType?.startsWith("image/") ||
                selectedItem.type === "image" ? (
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.alt || ""}
                    className="max-h-full max-w-full object-contain bg-muted/20"
                  />
                ) : (
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-primary/70 mx-auto" />
                    <p className="text-xs text-muted-foreground mt-2 uppercase font-mono">
                      {selectedItem.mimeType}
                    </p>
                  </div>
                )}
              </div>

              {/* Readonly Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs rounded-lg border border-border bg-muted/20 p-3.5">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block">
                    اسم الملف الأصلي
                  </span>
                  <span
                    className="font-bold text-foreground truncate block"
                    dir="ltr"
                  >
                    {selectedItem.originalName}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block">حجم الملف</span>
                  <span className="font-bold text-foreground block">
                    {formatBytes(selectedItem.size)}
                  </span>
                </div>
                <div className="space-y-0.5 col-span-2">
                  <span className="text-muted-foreground block">
                    رابط التضمين المباشر
                  </span>
                  <div className="flex gap-1.5 mt-1">
                    <input
                      type="text"
                      readOnly
                      value={selectedItem.url}
                      className="flex-1 rounded border border-border bg-background px-2 py-1 text-[10px] font-mono text-muted-foreground outline-none"
                      dir="ltr"
                    />
                    <button
                      onClick={() => handleCopyUrl(selectedItem.url)}
                      className="px-2 border border-border rounded bg-background hover:bg-muted text-foreground flex items-center transition shrink-0 cursor-pointer"
                      title="نسخ الرابط"
                    >
                      {copiedUrl === selectedItem.url ? (
                        <Check className="h-3 w-3 text-green-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                    <a
                      href={selectedItem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 border border-border rounded bg-background hover:bg-muted text-foreground flex items-center transition shrink-0 cursor-pointer"
                      title="فتح في نافذة جديدة"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Edit Fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-semibold">
                    مجلد الحفظ
                  </label>
                  <select
                    value={editFolder}
                    onChange={(e) => setEditFolder(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary transition"
                  >
                    {folders.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-semibold">
                    الوصف البديل للـ SEO (Alt text)
                  </label>
                  <textarea
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    rows={2}
                    placeholder="اكتب وصفاً معبراً للصورة لمحركات البحث وقارئ الشاشة..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-semibold">
                    الاستخدام (Usage)
                  </label>
                  <input
                    type="text"
                    value={editUsage}
                    onChange={(e) => setEditUsage(e.target.value)}
                    placeholder="مثال: صورة غلاف، أو لوجو الهيدر..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-2 p-4 border-t border-border bg-muted/20">
              <Button
                onClick={handleSaveDetails}
                disabled={updateMutation.isPending}
                className="text-xs font-bold px-4"
              >
                {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedItem(null)}
                className="text-xs font-semibold"
              >
                إلغاء التراجع
              </Button>
              <button
                onClick={() =>
                  setDeletingId(selectedItem.id ?? selectedItem._id ?? null)
                }
                className="mr-auto text-xs font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>حذف الملف نهائياً</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual cleanup dialog drawer (Unused media cleanup) */}
      {isCleanupOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-xl border border-red-500/20 bg-card/95 backdrop-blur-md max-w-lg w-full overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-red-500/5">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="text-sm font-bold">
                  تنظيف وتحرير المساحة التخزينية
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCleanupOpen(false);
                  setUnusedMedia(null);
                }}
                className="h-7 w-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                يقوم محرك الخادم بفحص ملفات مكتبة الوسائط التي تم رفعها ولكنها
                **غير مستخدمة** حالياً في أي مقال مدونة، أو مشروع، أو بيانات ملف
                شخصي، أو خدمة، ويتيح حذفها لتحرير سعة القرص.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-semibold">
                  فحص الملفات غير النشطة منذ (بالأيام):
                </label>
                <input
                  type="number"
                  min={7}
                  value={olderThanDays}
                  onChange={(e) =>
                    setOlderThanDays(Math.max(7, Number(e.target.value)))
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold outline-none focus:border-red-500/30 transition"
                />
                <span className="text-[10px] text-muted-foreground block mt-0.5">
                  الحد الأدنى للفحص هو 7 أيام لتفادي حذف الملفات المرفوعة
                  حديثاً.
                </span>
              </div>

              <Button
                variant="secondary"
                onClick={checkUnused}
                disabled={loadingUnused}
                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/5 flex items-center justify-center gap-2 text-xs font-bold"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loadingUnused ? "animate-spin" : ""}`}
                />
                <span>بدء الفحص عن الملحقات المهملة</span>
              </Button>

              {/* Cleanup Stats Box */}
              {unusedMedia && (
                <div className="p-4 rounded-lg border border-red-500/10 bg-red-500/5 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-2 bg-background/50 rounded border border-border">
                      <span className="text-[10px] text-muted-foreground block font-semibold">
                        الملفات غير المستخدمة
                      </span>
                      <span className="text-base font-bold text-foreground mt-0.5 block">
                        {unusedMedia.total} ملفات
                      </span>
                    </div>
                    <div className="p-2 bg-background/50 rounded border border-border">
                      <span className="text-[10px] text-muted-foreground block font-semibold">
                        المساحة القابلة للتحرير
                      </span>
                      <span className="text-base font-bold text-green-400 mt-0.5 block">
                        {formatBytes(unusedMedia.estimatedFreedBytes)}
                      </span>
                    </div>
                  </div>

                  {unusedMedia.total > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-red-300 text-center leading-relaxed">
                        ⚠️ تحذير: الضغط على زر التطهير سيقوم بمسح هذه الملفات
                        نهائياً من الـ Cloud Storage والقرص الصلب بدون إمكانية
                        للاسترجاع.
                      </p>
                      <Button
                        onClick={performCleanup}
                        disabled={cleaningUp}
                        variant="danger"
                        className="w-full text-xs font-bold py-2 flex items-center justify-center gap-2"
                      >
                        {cleaningUp ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>جاري تنظيف الملفات...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>تطهير وحذف جميع الملفات المهملة</span>
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-green-400 text-center font-semibold">
                      رائع! لا توجد أية ملفات مهملة في الخادم منذ{" "}
                      {olderThanDays} أيام.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center gap-2 p-4 border-t border-border bg-muted/20">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCleanupOpen(false);
                  setUnusedMedia(null);
                }}
                className="text-xs font-semibold"
              >
                إغلاق النافذة
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm deletion dialog */}
      <ConfirmDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            deleteMutation.mutate(deletingId);
          }
        }}
        title="حذف الملف نهائياً؟"
        description="هل أنت متأكد من رغبتك في إزالة هذا الملف من الخادم؟ لا يمكن التراجع عن هذا الإجراء وسيؤدي إلى كسر أي روابط تستخدم هذا الملف في أجزاء الموقع!"
        confirmText="نعم، حذف نهائي"
        cancelText="إلغاء التراجع"
        variant="danger"
        isSubmitting={deleteMutation.isPending}
      />
    </div>
  );
}
