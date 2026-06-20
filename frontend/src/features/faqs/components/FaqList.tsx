"use client";

import { ChevronDown, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/State";
import type { Faq } from "@/lib/api/types";

function FaqItem({ faq }: { faq: Faq }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`overflow-hidden rounded-lg border bg-card transition ${isOpen ? "border-primary/30" : "border-border"}`}>
      <button
        className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-right font-semibold text-foreground transition hover:text-primary"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{faq.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="border-t border-border/40 bg-muted/5 p-5 pt-4 text-sm leading-8 text-muted-foreground">
              {faq.answer}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return faqs;
    return faqs.filter((faq) => `${faq.question} ${faq.answer} ${faq.category ?? ""}`.toLowerCase().includes(value));
  }, [faqs, query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, Faq[]>>((acc, faq) => {
      const category = faq.category || "عام";
      acc[category] = acc[category] ?? [];
      acc[category].push(faq);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="space-y-5">
      <label className="relative block">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ابحث في الأسئلة..."
          className="input-glow h-11 w-full rounded-md border border-border bg-background pr-10 pl-3 text-sm outline-none"
        />
      </label>

      {filtered.length ? (
        Object.entries(grouped).map(([category, items]) => (
          <section key={category} className="space-y-3">
            <h3 className="font-mono text-xs font-semibold text-primary" dir="ltr">
              {`// ${category}`}
            </h3>
            {items.map((faq) => (
              <FaqItem key={faq.id || faq.question} faq={faq} />
            ))}
          </section>
        ))
      ) : (
        <EmptyState title="لا توجد نتائج مطابقة" description="جرّب كلمة مختلفة أو أرسل سؤالك مباشرة من صفحة التواصل." />
      )}
    </div>
  );
}
