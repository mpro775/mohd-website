import Link from "next/link";
import { ArrowUpLeft } from "lucide-react";
import type { Service } from "@/lib/api/types";

export function ServiceCard({ service }: { service: Service }) {
  const price = service.price ?? (service.startingPrice ? `${service.startingPrice} ${service.currency ?? "USD"}` : "حسب نطاق العمل");
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-muted font-mono text-primary">{service.icon ?? "</>"}</div>
      <h3 className="text-xl font-bold">{service.name}</h3>
      <p className="mt-3 leading-7 text-muted-foreground">{service.shortDescription}</p>
      <p className="mt-4 font-semibold text-primary">{price}</p>
      {service.deliverables?.length ? (
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {service.deliverables.slice(0, 4).map((item) => <li key={item}>- {item}</li>)}
        </ul>
      ) : null}
      <Link href={`/services/${service.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        التفاصيل <ArrowUpLeft className="h-4 w-4" />
      </Link>
    </article>
  );
}
