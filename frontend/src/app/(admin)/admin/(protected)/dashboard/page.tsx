"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  RefreshCw, 
  FolderGit2, 
  FileText, 
  HardDrive, 
  Mail, 
  Eye, 
  ArrowRightLeft, 
  Plus, 
  Settings, 
  ShieldAlert, 
  MessageSquare,
  Sparkles,
  Link2,
  HelpCircle,
  Cpu,
  Boxes
} from "lucide-react";
import { toast } from "sonner";

import { adminQueryKeys } from "@/lib/api/admin-query-keys";
import { clientApiRequest } from "@/lib/api/admin-client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type DashboardStats = {
  content: {
    projects: { total: number; published: number; draftOrUnpublished: number; archived: number; featured: number };
    posts: { total: number; published: number; draft: number; scheduled: number; archived: number; featured: number };
    services: { total: number; published: number; featured: number };
    technologies: { total: number; published: number; highlighted: number };
    links: { total: number; published: number; featured: number };
    faqs: { total: number; published: number; featured: number };
  };
  engagement: {
    projectViews: number;
    postViews: number;
    linkClicks: number;
  };
  contact: { total: number; unread: number; replied: number; archived: number; spam: number };
  media: { total: number; used: number; unused: number; totalSize: number };
  recent: {
    messages: Array<{ _id: string; name: string; email: string; subject: string; message: string; status: string; createdAt: string }>;
    posts: Array<{ _id: string; title: string; slug: string; status: string; views: number; createdAt: string }>;
    projects: Array<{ _id: string; title: string; coverImage?: string; views: number; createdAt: string }>;
  };
};

export default function DashboardPage() {
  const [recentTab, setRecentTab] = useState<"messages" | "posts" | "projects">("messages");

  // 1. Fetch Dashboard Stats using React Query
  const { data, isLoading, isRefetching, refetch, error } = useQuery<DashboardStats>({
    queryKey: adminQueryKeys.dashboard(),
    queryFn: async () => {
      const response = await clientApiRequest<DashboardStats>("dashboard/stats");
      return response.data;
    },
  });

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("تم تحديث إحصائيات لوحة التحكم فوراً");
    } catch {
      toast.error("فشل تحديث البيانات");
    }
  };

  // Helper: Format bytes to MB/GB
  function formatBytes(bytes: number) {
    if (!bytes || bytes === 0) return "0.0 MB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Helper: Format Dates in Arabic
  function formatArabicDate(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <AdminPageHeader title="لوحة التحكم" description="جاري جلب إحصائيات لوحة التحكم..." />
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 rounded-xl border border-border bg-card animate-pulse" />
          <div className="h-96 rounded-xl border border-border bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6 text-right" dir="rtl">
        <AdminPageHeader title="لوحة التحكم" description="تعذر تحميل إحصائيات لوحة التحكم." />
        <div className="rounded-xl border border-danger/20 bg-danger/5 p-8 text-center space-y-4">
          <p className="text-danger font-bold text-sm">حدث خطأ أثناء تحميل بيانات إحصائيات النظام من الخادم.</p>
          <button
            onClick={handleRefresh}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>إعادة محاولة التحميل</span>
          </button>
        </div>
      </div>
    );
  }

  const { content, engagement, contact, media, recent } = data;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Dashboard Top Header */}
      <AdminPageHeader
        title="لوحة التحكم"
        description="نظرة شاملة وسريعة على نمو موقعك الشخصي، أحدث التفاعلات، ومقاييس الأداء للمحتوى."
      >
        <button
          onClick={handleRefresh}
          disabled={isRefetching}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition select-none disabled:opacity-50"
          title="تحديث البيانات"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          <span>تحديث إحصائي فوري</span>
        </button>
      </AdminPageHeader>

      {/* 1. Main KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* KPI 1: Projects */}
        <div className="group rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 shadow-sm hover:border-primary/40 hover:shadow transition duration-300 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase">معرض أعمالك</span>
              <h3 className="text-2xl font-black text-foreground">{content.projects.total}</h3>
              <p className="text-[10px] text-muted-foreground">
                المشاريع المنشورة: <strong className="text-foreground">{content.projects.published}</strong>
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition duration-300">
              <FolderGit2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Eye className="h-3.5 w-3.5 text-primary/70" />
            <span>مشاهدات المشاريع: <strong>{engagement.projectViews}</strong></span>
          </div>
        </div>

        {/* KPI 2: Blog Posts */}
        <div className="group rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 shadow-sm hover:border-emerald-500/40 hover:shadow transition duration-300 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase">محتوى المدونة</span>
              <h3 className="text-2xl font-black text-foreground">{content.posts.total}</h3>
              <p className="text-[10px] text-muted-foreground">
                المنشورة: <strong className="text-foreground">{content.posts.published}</strong> | مسودات: <strong className="text-foreground">{content.posts.draft}</strong>
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Eye className="h-3.5 w-3.5 text-emerald-500/70" />
            <span>مشاهدات المقالات: <strong>{engagement.postViews}</strong></span>
          </div>
        </div>

        {/* KPI 3: Inbox messages */}
        <div className="group rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 shadow-sm hover:border-amber-500/40 hover:shadow transition duration-300 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase">الرسائل والاتصالات</span>
              <h3 className="text-2xl font-black text-foreground">{contact.total}</h3>
              <p className="text-[10px] text-muted-foreground">
                تم الرد: <strong className="text-foreground">{contact.replied}</strong> | مؤرشف: <strong className="text-foreground">{contact.archived}</strong>
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Mail className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5 text-amber-500/70" />
              <span>رسائل البريد الوارد</span>
            </div>
            {contact.unread > 0 && (
              <span className="px-2 py-0.5 rounded-full font-bold text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 animate-pulse">
                {contact.unread} جديدة
              </span>
            )}
          </div>
        </div>

        {/* KPI 4: Media Library Storage */}
        <div className="group rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 shadow-sm hover:border-sky-500/40 hover:shadow transition duration-300 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase">مكتبة الوسائط</span>
              <h3 className="text-2xl font-black text-foreground">{media.total}</h3>
              <p className="text-[10px] text-muted-foreground">
                مساحة التخزين: <strong className="text-foreground" dir="ltr">{formatBytes(media.totalSize)}</strong>
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-sky-500/70" />
              <span>ملفات وسائط مهملة</span>
            </div>
            {media.unused > 0 && (
              <span className="font-bold text-amber-400">
                {media.unused} ملف مهمل
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 2. Middle Row: Quick Actions, Recent activity Tabs and Content breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Tabbed Activity Timeline (2/3 width on desktop) */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card/50 backdrop-blur-md shadow-sm overflow-hidden flex flex-col">
          
          {/* Header & Tabs */}
          <div className="border-b border-border bg-muted/20 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-xs font-black text-foreground">أحدث النشاطات والتحديثات</h4>
            
            <nav className="flex gap-1.5 border border-border bg-background p-1 rounded-lg">
              <button
                onClick={() => setRecentTab("messages")}
                className={`px-3 py-1 text-[10px] font-black rounded-md transition cursor-pointer ${recentTab === "messages" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                الرسائل الواردة ({recent.messages.length})
              </button>
              <button
                onClick={() => setRecentTab("posts")}
                className={`px-3 py-1 text-[10px] font-black rounded-md transition cursor-pointer ${recentTab === "posts" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                آخر المقالات ({recent.posts.length})
              </button>
              <button
                onClick={() => setRecentTab("projects")}
                className={`px-3 py-1 text-[10px] font-black rounded-md transition cursor-pointer ${recentTab === "projects" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                آخر المشاريع ({recent.projects.length})
              </button>
            </nav>
          </div>

          {/* Tab Panels */}
          <div className="flex-1 p-5 overflow-y-auto max-h-[360px]">
            
            {/* Panel A: Recent Messages */}
            {recentTab === "messages" && (
              recent.messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  صندوق الوارد نظيف تماماً! لا توجد أية رسائل تواصل جديدة حالياً.
                </div>
              ) : (
                <div className="space-y-4">
                  {recent.messages.map((msg) => (
                    <div key={msg._id} className="p-3.5 rounded-lg border border-border bg-card/45 hover:border-primary/20 transition flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-foreground">{msg.name}</h5>
                          <span className="text-[9px] font-mono text-muted-foreground" dir="ltr">({msg.email})</span>
                          {msg.status === "new" && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-red-500/10 text-red-400 font-bold">جديدة</span>
                          )}
                        </div>
                        <p className="text-[10px] text-foreground/80 font-bold mt-0.5">الموضوع: {msg.subject}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">{msg.message}</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground shrink-0 font-medium whitespace-nowrap">
                        {formatArabicDate(msg.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Panel B: Recent Posts */}
            {recentTab === "posts" && (
              recent.posts.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  لا توجد مقالات منشورة أو مسودات مضافة في المدونة حالياً.
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.posts.map((post) => (
                    <div key={post._id} className="p-3 rounded-lg border border-border bg-card/45 flex items-center justify-between gap-3">
                      <div className="truncate max-w-[70%]">
                        <h5 className="text-xs font-bold text-foreground truncate">{post.title}</h5>
                        <p className="text-[9px] text-muted-foreground font-mono truncate mt-0.5" dir="ltr">/blog/{post.slug}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          post.status === "published" 
                            ? "bg-green-500/10 text-green-400" 
                            : post.status === "draft" 
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {post.status === "published" ? "منشور" : post.status === "draft" ? "مسودة" : post.status}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Eye className="h-3.5 w-3.5" />
                          <span>{post.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Panel C: Recent Projects */}
            {recentTab === "projects" && (
              recent.projects.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  لم يتم رفع أو إدراج أية مشاريع في سابقة الأعمال الخاصة بك بعد.
                </div>
              ) : (
                <div className="space-y-3">
                  {recent.projects.map((proj) => (
                    <div key={proj._id} className="p-3 rounded-lg border border-border bg-card/45 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 truncate max-w-[70%]">
                        <div className="h-8 w-8 rounded border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                          {proj.coverImage ? (
                            <img src={proj.coverImage} alt={proj.title} className="h-full w-full object-cover bg-muted/20" />
                          ) : (
                            <FolderGit2 className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="truncate">
                          <h5 className="text-xs font-bold text-foreground truncate">{proj.title}</h5>
                          <span className="text-[9px] text-muted-foreground font-medium block">تاريخ الإضافة: {formatArabicDate(proj.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground shrink-0">
                        <Eye className="h-3.5 w-3.5" />
                        <span>مشاهدات: {proj.views || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

          </div>
        </div>

        {/* Sidebar: Quick Actions & Content Summary (1/3 width) */}
        <div className="space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 shadow-sm space-y-3.5">
            <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <ArrowRightLeft className="h-4 w-4 text-primary" />
              <span>إجراءات إدارية سريعة</span>
            </h4>
            
            <div className="grid grid-cols-1 gap-2 pt-1">
              <Link
                href="/admin/blog/posts"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary/30 bg-background/50 text-xs font-bold text-foreground hover:bg-muted/30 transition group text-right"
              >
                <div className="h-7 w-7 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <span className="block">أضف مقالاً جديداً</span>
                  <span className="text-[9px] text-muted-foreground block font-medium mt-0.5">تأليف مقال تفاعلي وتهيئته</span>
                </div>
              </Link>

              <Link
                href="/admin/projects"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary/30 bg-background/50 text-xs font-bold text-foreground hover:bg-muted/30 transition group text-right"
              >
                <div className="h-7 w-7 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <span className="block">أضف مشروعاً جديداً</span>
                  <span className="text-[9px] text-muted-foreground block font-medium mt-0.5">إرفاق عمل لسابقة مشاريعك</span>
                </div>
              </Link>

              <Link
                href="/admin/profile"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary/30 bg-background/50 text-xs font-bold text-foreground hover:bg-muted/30 transition group text-right"
              >
                <div className="h-7 w-7 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <span className="block">تحديث معلوماتك الشخصية</span>
                  <span className="text-[9px] text-muted-foreground block font-medium mt-0.5">الاسم، النبذة، والروابط</span>
                </div>
              </Link>

              <Link
                href="/admin/media"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border hover:border-primary/30 bg-background/50 text-xs font-bold text-foreground hover:bg-muted/30 transition group text-right"
              >
                <div className="h-7 w-7 rounded bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <span className="block">تنظيف مكتبة الوسائط</span>
                  <span className="text-[9px] text-muted-foreground block font-medium mt-0.5">تفريغ سعة الخادم والملفات المهملة</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Sub-Contents Summary */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
              <Boxes className="h-4 w-4 text-primary" />
              <span>مكونات المحتوى والروابط العامة</span>
            </h4>
            
            <div className="space-y-2.5 text-xs">
              
              <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/40">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold">الخدمات التقنية (Services)</span>
                </div>
                <span className="font-black text-foreground">{content.services.total}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/40">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-indigo-400" />
                  <span className="font-bold">مهارات وتقنيات (Skills)</span>
                </div>
                <span className="font-black text-foreground">{content.technologies.total}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/40">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-sky-400" />
                  <span className="font-bold">الروابط السريعة (Links)</span>
                </div>
                <span className="font-black text-foreground">{content.links.total}</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/40">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-amber-400" />
                  <span className="font-bold">الأسئلة الشائعة (FAQs)</span>
                </div>
                <span className="font-black text-foreground">{content.faqs.total}</span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
