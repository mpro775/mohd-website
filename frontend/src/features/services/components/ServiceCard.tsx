import { ArrowUpLeft, Check } from "lucide-react";
import type { Service } from "@/lib/api/types";
import { LinkButton } from "@/components/common/Button";

export function ServiceCard({ service }: { service: Service }) {
  const price = service.price ?? (service.startingPrice ? `${service.startingPrice} ${service.currency ?? "USD"}` : "حسب نطاق العمل");
  return (
    <article className="group rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-[0_16px_48px_-16px_rgba(55,211,153,0.15)] flex flex-col justify-between h-full relative overflow-hidden">
      {/* Subtle glow behind icon on hover */}
      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-primary/0 transition-all duration-500 group-hover:bg-primary/5 blur-2xl pointer-events-none" />
      
      <div className="relative">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-primary/20 bg-primary/5 font-mono text-xl text-primary shadow-sm select-none transition-all duration-300 group-hover:bg-primary/10 group-hover:border-primary/40 group-hover:shadow-[0_0_16px_-4px_rgba(55,211,153,0.2)]">
          {service.icon ?? "</>"}
        </div>
        
        <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{service.shortDescription}</p>
        
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="inline-flex rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
            {price}
          </span>
          {service.duration && (
            <span className="inline-flex rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground font-mono" dir="ltr">
              duration: {service.duration}
            </span>
          )}
        </div>

        {service.deliverables?.length ? (
          <div className="mt-5 space-y-2.5 border-t border-border/40 pt-4">
            <span className="font-mono text-[10px] text-muted-foreground/60 block uppercase select-none">{"// Deliverables:"}</span>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {service.deliverables.slice(0, 4).map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mt-6 pt-1">
        <LinkButton href={`/services/${service.slug}`} variant="terminal" size="sm" className="w-full gap-1.5">
          تفاصيل الخدمة <ArrowUpLeft className="h-4 w-4" />
        </LinkButton>
      </div>
    </article>
  );
}
