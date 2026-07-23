"use client";

import { useQueries } from "@tanstack/react-query";
import { AlertTriangle, CalendarClock, Eye, FileEdit, Files, MessagesSquare } from "lucide-react";
import { adminClient } from "@/lib/api/admin-client";

const cards = [
  { key: "all", label: "كل المقالات", query: {}, icon: Files },
  { key: "draft", label: "المسودات", query: { status: "draft" }, icon: FileEdit },
  { key: "in_review", label: "المراجعة", query: { status: "in_review" }, icon: MessagesSquare },
  { key: "scheduled", label: "المجدولة", query: { status: "scheduled" }, icon: CalendarClock },
  { key: "published", label: "المنشورة", query: { status: "published" }, icon: Eye },
  { key: "warnings", label: "تحتاج انتباه", query: { hasWarnings: true }, icon: AlertTriangle },
] as const;

export function PostStatsOverview({
  onSelect,
}: {
  onSelect: (key: (typeof cards)[number]["key"]) => void;
}) {
  const queries = useQueries({
    queries: cards.map((card) => ({
      queryKey: ["blog-post-stats", card.key],
      queryFn: () => adminClient.listResource("blog/posts", { ...card.query, page: 1, limit: 1 }),
      staleTime: 30_000,
    })),
  });
  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6" aria-label="ملخص المقالات">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const query = queries[index];
        return (
          <button key={card.key} type="button" onClick={() => onSelect(card.key)} className="group rounded-2xl border border-border bg-card p-4 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40">
            <div className="flex items-center justify-between">
              <Icon className={`h-4 w-4 ${card.key === "warnings" ? "text-amber-500" : "text-primary"}`} />
              {query.isLoading ? <span className="h-6 w-10 animate-pulse rounded bg-muted" /> : <span className="text-xl font-black">{query.isError ? "—" : query.data?.meta.total.toLocaleString("ar-SA")}</span>}
            </div>
            <p className="mt-2 text-xs font-bold text-muted-foreground group-hover:text-foreground">{card.label}</p>
          </button>
        );
      })}
    </section>
  );
}
