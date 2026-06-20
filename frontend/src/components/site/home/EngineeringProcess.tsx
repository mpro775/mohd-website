import { Bug, DraftingCompass, Hammer, Layers3, Rocket, ScanSearch } from "lucide-react";
import { SectionHeader } from "@/components/common/SectionHeader";

const steps = [
  {
    title: "Diagnose",
    description: "أفهم المشكلة، الجمهور، النطاق، والهدف التجاري.",
    output: "Scope map",
    icon: ScanSearch,
  },
  {
    title: "Design",
    description: "أبني تجربة استخدام واضحة وهوية واجهة متناسقة.",
    output: "UX direction",
    icon: DraftingCompass,
  },
  {
    title: "Architecture",
    description: "أحدد البيانات، API، الصلاحيات، وتدفق النظام.",
    output: "System blueprint",
    icon: Layers3,
  },
  {
    title: "Build",
    description: "أنفذ Frontend وBackend بتقسيم واضح وقابل للصيانة.",
    output: "Working product",
    icon: Hammer,
  },
  {
    title: "QA",
    description: "أراجع الأداء، الأخطاء، التجاوب، وتجربة الاستخدام.",
    output: "Release checks",
    icon: Bug,
  },
  {
    title: "Deploy",
    description: "أجهز المشروع للنشر ومراقبة النسخة الإنتاجية.",
    output: "Production handoff",
    icon: Rocket,
  },
];

export function EngineeringProcess() {
  return (
    <section className="section-shell border-y border-border/50 bg-muted/5">
      <SectionHeader
        eyebrow="Engineering Process"
        title="طريقة عمل من التشخيص إلى الإنتاج"
        description="عملية واضحة تربط التصميم والهندسة والنشر حتى لا يبقى المشروع مجرد واجهة جميلة."
      />
      <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <div className="pointer-events-none absolute left-8 right-8 top-14 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />
        {steps.map((step, index) => (
          <article key={step.title} className="premium-card relative p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span dir="ltr" className="font-mono text-xs text-primary">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                <step.icon className="h-4 w-4 text-primary" />
              </span>
            </div>
            <h3 dir="ltr" className="font-mono text-base font-bold text-foreground">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>
            <p dir="ltr" className="mt-4 rounded-md border border-border bg-background/60 px-3 py-2 font-mono text-[10px] text-muted-foreground">
              output: {step.output}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
