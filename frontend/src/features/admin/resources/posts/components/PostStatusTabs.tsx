"use client";

const tabs = [
  { label: "الكل", status: "all", trash: "all" },
  { label: "مسودة", status: "draft", trash: "all" },
  { label: "قيد المراجعة", status: "in_review", trash: "all" },
  { label: "مطلوب تعديل", status: "changes_requested", trash: "all" },
  { label: "مجدول", status: "scheduled", trash: "all" },
  { label: "منشور", status: "published", trash: "all" },
  { label: "مؤرشف", status: "archived", trash: "all" },
  { label: "السلة", status: "all", trash: "true" },
];

export function PostStatusTabs({
  status,
  trash,
  onChange,
}: {
  status: string;
  trash: string;
  onChange: (status: string, trash: string) => void;
}) {
  return (
    <nav className="flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1" aria-label="حالات المقالات">
      {tabs.map((tab) => {
        const active = tab.trash === "true" ? trash === "true" : trash !== "true" && status === tab.status;
        return (
          <button key={tab.label} type="button" onClick={() => onChange(tab.status, tab.trash)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
