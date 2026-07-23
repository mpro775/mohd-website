"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { toast } from "sonner";
import {
  LayoutDashboard,
  User,
  FolderGit2,
  FileText,
  Tags,
  Hash,
  Briefcase,
  Cpu,
  Link2,
  HelpCircle,
  Image,
  Mail,
  ShieldAlert,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  Sun,
  Moon,
  X,
  BadgeCheck,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminLayoutModeContext } from "./AdminLayoutModeContext";

// Icon mapping helper
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/profile": User,
  "/admin/certifications": BadgeCheck,
  "/admin/education": GraduationCap,
  "/admin/projects": FolderGit2,
  "/admin/blog/posts": FileText,
  "/admin/blog/categories": Tags,
  "/admin/blog/tags": Hash,
  "/admin/services": Briefcase,
  "/admin/technologies": Cpu,
  "/admin/links": Link2,
  "/admin/faqs": HelpCircle,
  "/admin/media": Image,
  "/admin/contact": Mail,
  "/admin/audit-logs": ShieldAlert,
};

// Organized navigation groups
const navGroups = [
  {
    title: "نظرة عامة",
    items: [
      { href: "/admin/dashboard", label: "لوحة التحكم" },
      { href: "/admin/profile", label: "الملف الشخصي" },
      { href: "/admin/certifications", label: "الشهادات المهنية" },
      { href: "/admin/education", label: "المؤهلات الأكاديمية" },
    ],
  },
  {
    title: "المحتوى",
    items: [
      { href: "/admin/projects", label: "المشاريع" },
      { href: "/admin/services", label: "الخدمات" },
      { href: "/admin/technologies", label: "التقنيات" },
      { href: "/admin/faqs", label: "الأسئلة الشائعة" },
    ],
  },
  {
    title: "المدونة",
    items: [
      { href: "/admin/blog/posts", label: "المقالات" },
      { href: "/admin/blog/categories", label: "التصنيفات" },
      { href: "/admin/blog/tags", label: "الوسوم" },
    ],
  },
  {
    title: "الوسائط والاتصالات",
    items: [
      { href: "/admin/media", label: "الوسائط" },
      { href: "/admin/contact", label: "الرسائل الواردة" },
    ],
  },
  {
    title: "النظام والروابط",
    items: [
      { href: "/admin/links", label: "الروابط الخارجية" },
      { href: "/admin/audit-logs", label: "سجل العمليات" },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusMode, setFocusMode] = useState(false);

  // Command input ref
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Fetch logged in user info
  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const payload = await response.json();
          if (payload?.data) {
            setUser(payload.data);
          }
        }
      } catch {
        // Fallback silently
      }
    }
    loadUser();
  }, []);

  // Sync collapsed state with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("admin_sidebar_collapsed");
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("admin_sidebar_collapsed", String(nextState));
  };

  // Keyboard shortcut for Command Menu (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter links for Command Menu
  const allNavItems = navGroups.flatMap((g) => g.items);
  const filteredNavItems = allNavItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.href.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Command Menu keyboard navigation
  useEffect(() => {
    if (isCommandOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
      setTimeout(() => commandInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [isCommandOpen]);

  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredNavItems.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredNavItems.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredNavItems[selectedIndex]) {
        router.push(filteredNavItems[selectedIndex].href);
        setIsCommandOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsCommandOpen(false);
    }
  };

  // Dynamic Breadcrumbs
  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    const breadcrumbs = [];
    let accumulatedPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      accumulatedPath += `/${part}`;
      
      // Find matching item or format nicely
      let label = part;
      const matchingItem = allNavItems.find((item) => item.href === accumulatedPath);
      
      if (part === "admin") {
        label = "لوحة الإدارة";
      } else if (part === "blog") {
        label = "المدونة";
      } else if (matchingItem) {
        label = matchingItem.label;
      }

      breadcrumbs.push({
        label,
        href: accumulatedPath,
        isLast: i === parts.length - 1,
      });
    }
    return breadcrumbs;
  };

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/admin/login");
      router.refresh();
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  }

  const breadcrumbs = getBreadcrumbs();

  return (
    <AdminLayoutModeContext.Provider value={{ focusMode, setFocusMode }}>
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row relative">
      
      {/* 1. Sidebar for Desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-l border-border bg-card transition-all duration-300 shrink-0 sticky top-0 h-screen select-none",
          isCollapsed ? "w-20" : "w-64",
          focusMode && "!hidden",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link
            href="/admin/dashboard"
            className={cn(
              "font-mono font-black text-primary transition-all duration-300 truncate",
              isCollapsed ? "text-sm mx-auto" : "text-xl"
            )}
          >
            {isCollapsed ? "CMS" : "Mohd CMS"}
          </Link>
          {!isCollapsed && (
            <button
              onClick={toggleCollapse}
              className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="طي القائمة"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground/75 uppercase select-none mb-1">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = iconMap[item.href] || FolderGit2;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground/80")} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                      
                      {/* Tooltip for Collapsed State */}
                      {isCollapsed && (
                        <div className="pointer-events-none absolute right-full mr-2 z-50 rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100 whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border flex flex-col gap-1.5">
          {isCollapsed ? (
            <button
              onClick={toggleCollapse}
              className="flex h-9 w-9 mx-auto items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="توسيع القائمة"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0 uppercase">
                {(user?.name || "A").substring(0, 1)}
              </div>
              <div className="flex-1 min-w-0 select-none">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.name || "مسؤول النظام"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate" dir="ltr">
                  {user?.email || "admin@mohd.site"}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-all",
              isCollapsed && "justify-center"
            )}
            title="تسجيل الخروج"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!isCollapsed && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Drawer Navigation via Radix Dialog */}
      <DialogPrimitive.Root open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" />
          <DialogPrimitive.Content
            className="fixed top-0 bottom-0 right-0 z-50 w-72 h-full border-l border-border bg-card p-6 shadow-xl flex flex-col justify-between duration-300 animate-in slide-in-from-right"
            dir="rtl"
          >
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-border">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsMobileOpen(false)}
                  className="font-mono text-xl font-black text-primary"
                >
                  Mohd CMS
                </Link>
                <DialogPrimitive.Close className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer">
                  <X className="h-5 w-5" />
                </DialogPrimitive.Close>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
                {navGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1">
                    <p className="px-3 text-[10px] font-bold tracking-wider text-muted-foreground/75 uppercase select-none mb-1">
                      {group.title}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const Icon = iconMap[item.href] || FolderGit2;
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative cursor-pointer",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4.5 w-4.5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/30">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {(user?.name || "A").substring(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {user?.name || "مسؤول النظام"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate" dir="ltr">
                    {user?.email || "admin@mohd.site"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 cursor-pointer w-full transition-all"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* 3. Main Dashboard Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className={cn("h-16 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-40 select-none shadow-sm", focusMode && "hidden")}>
          
          {/* Breadcrumbs & Mobile Trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Dynamic Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Link href="/admin/dashboard" className="hover:text-foreground transition-colors">
                لوحة التحكم
              </Link>
              {breadcrumbs.map((bc) => (
                <React.Fragment key={bc.href}>
                  <span className="text-muted-foreground/50">/</span>
                  {bc.isLast ? (
                    <span className="text-foreground font-semibold truncate max-w-[120px]">
                      {bc.label}
                    </span>
                  ) : (
                    <Link
                      href={bc.href}
                      className="hover:text-foreground transition-colors truncate max-w-[120px]"
                    >
                      {bc.label}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Right Header: Search, Theme, User Menu */}
          <div className="flex items-center gap-2">
            
            {/* Command search input (clickable trigger) */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="flex items-center gap-2 h-9 border border-border bg-muted/30 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted/70 transition w-32 sm:w-48 text-right justify-between cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <span className="flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" />
                <span>بحث...</span>
              </span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-card px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
                <span className="text-[10px]">Ctrl</span>K
              </kbd>
            </button>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition"
              title="تبديل المظهر"
            >
              <Sun className="h-4.5 w-4.5 dark:hidden" />
              <Moon className="h-4.5 w-4.5 hidden dark:block text-primary" />
            </button>

            {/* Quick Logout Button */}
            <button
              onClick={logout}
              className="hidden sm:inline-flex h-9 items-center gap-1.5 border border-border px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 cursor-pointer transition"
              title="تسجيل الخروج السريع"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className={cn("flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-background/50 custom-scrollbar", focusMode && "!p-0")}>
          {children}
        </main>
      </div>

      {/* 4. Command Menu Dialog */}
      <DialogPrimitive.Root open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" />
          <DialogPrimitive.Content
            className="fixed top-[20%] left-[50%] z-50 w-full max-w-lg translate-x-[-50%] rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95"
            dir="rtl"
            onKeyDown={handleCommandKeyDown}
          >
            {/* Input search */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3 bg-muted/20">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={commandInputRef}
                type="text"
                placeholder="ابحث عن صفحة أو إجراء..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent py-1 text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button
                onClick={() => setIsCommandOpen(false)}
                className="rounded p-1 hover:bg-muted text-muted-foreground text-xs"
              >
                ESC
              </button>
            </div>

            {/* List results */}
            <div className="max-h-72 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase select-none">
                الصفحات المتاحة
              </p>
              
              {filteredNavItems.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  لا توجد نتائج متطابقة للبحث
                </div>
              ) : (
                filteredNavItems.map((item, idx) => {
                  const Icon = iconMap[item.href] || FolderGit2;
                  const isSelected = idx === selectedIndex;

                  return (
                    <div
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setIsCommandOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold cursor-pointer transition",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                        <span>{item.label}</span>
                      </div>
                      <span className={cn("text-[9px] font-mono opacity-80", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
                        {item.href}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

    </div>
    </AdminLayoutModeContext.Provider>
  );
}
