import type { Faq } from "@/lib/api/types";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-4">
      {faqs.map((faq) => (
        <details
          key={faq.id || faq.question}
          className="group rounded-lg border border-border bg-card transition-all duration-200 open:border-primary/30 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold text-foreground transition hover:text-primary focus:outline-none select-none">
            <span>{faq.question}</span>
            <span className="ml-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-muted/50 font-mono text-[9px] text-muted-foreground group-open:rotate-180 transition-transform duration-200">
              ▼
            </span>
          </summary>
          <div className="border-t border-border/40 p-5 pt-4 text-sm leading-8 text-muted-foreground bg-muted/5">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
