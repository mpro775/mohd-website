import type { Faq } from "@/lib/api/types";

export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <details key={`${faq.category}-${faq.question}`} className="rounded-lg border border-border bg-card p-5">
          <summary className="cursor-pointer font-semibold">{faq.question}</summary>
          <p className="mt-3 leading-8 text-muted-foreground">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
