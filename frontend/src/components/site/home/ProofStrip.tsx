import { Gauge, Layers3, Network, ShieldCheck, Sparkles } from "lucide-react";
import { brand } from "@/config/brand";

const icons = [ShieldCheck, Layers3, Network, Gauge, Sparkles];

export function ProofStrip() {
  return (
    <section className="border-y border-border/60 bg-card/20">
      <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
        {brand.proofPoints.map((point, index) => {
          const Icon = icons[index] ?? ShieldCheck;
          return (
            <div
              key={point}
              className="glass-panel flex min-w-[220px] items-center gap-3 px-4 py-3"
              dir="ltr"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="font-mono text-xs font-semibold text-foreground">{point}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
