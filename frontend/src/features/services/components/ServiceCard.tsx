import { ArrowUpLeft, Check, Package } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import type { Service } from "@/lib/api/types";

function badgeFor(service: Service) {
  const text = `${service.name} ${service.shortDescription}`.toLowerCase();
  if (text.includes("mvp")) return "MVP";
  if (text.includes("dashboard") || text.includes("admin")) return "Dashboard";
  if (text.includes("api") || text.includes("backend")) return "API";
  if (text.includes("frontend") || text.includes("ui")) return "Frontend";
  if (text.includes("deploy")) return "Deployment";
  return "Package";
}

export function ServiceCard({ service }: { service: Service }) {
  const price = service.price ?? (service.startingPrice ? `${service.startingPrice} ${service.currency ?? "USD"}` : "حسب نطاق العمل");

  return (
    <article className="premium-card group flex h-full flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40">
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </span>
          <span dir="ltr" className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[10px] text-primary">
            {badgeFor(service)}
          </span>
        </div>

        <h3 className="text-xl font-bold text-foreground">{service.name}</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{service.shortDescription}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
            {price}
          </span>
          {service.duration ? (
            <span dir="ltr" className="rounded-md border border-border bg-background/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
              duration: {service.duration}
            </span>
          ) : null}
        </div>

        {service.deliverables?.length ? (
          <ul className="mt-5 space-y-2 border-t border-border/40 pt-4 text-sm text-muted-foreground">
            {service.deliverables.slice(0, 4).map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <LinkButton href={`/services/${service.slug}`} variant="terminal" size="sm" className="mt-6 w-full gap-1.5">
        تفاصيل الخدمة <ArrowUpLeft className="h-4 w-4" />
      </LinkButton>
    </article>
  );
}
