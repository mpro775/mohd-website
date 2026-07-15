"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Bug,
  ChevronLeft,
  DraftingCompass,
  Hammer,
  Layers3,
  Rocket,
  ScanSearch,
} from "lucide-react";
import { Container } from "@/components/common/Container";

const steps = [
  {
    title: "Diagnose",
    titleAr: "التشخيص",
    description: "أفهم المشكلة، الجمهور، النطاق، والهدف التجاري قبل كتابة أي سطر كود.",
    output: "Scope Map",
    icon: ScanSearch,
    color: "var(--primary)",
  },
  {
    title: "Design",
    titleAr: "التصميم",
    description: "أبني تجربة استخدام واضحة وهوية واجهة متناسقة تخدم أهداف المنتج.",
    output: "UX Direction",
    icon: DraftingCompass,
    color: "var(--secondary)",
  },
  {
    title: "Architecture",
    titleAr: "الهندسة",
    description: "أحدد البيانات، API، الصلاحيات، وتدفق النظام بشكل قابل للتوسع.",
    output: "System Blueprint",
    icon: Layers3,
    color: "#a78bfa",
  },
  {
    title: "Build",
    titleAr: "البناء",
    description: "أنفذ Frontend وBackend بتقسيم واضح وقابل للصيانة مع أفضل الممارسات.",
    output: "Working Product",
    icon: Hammer,
    color: "#f7c948",
  },
  {
    title: "QA",
    titleAr: "الجودة",
    description: "أراجع الأداء، الأخطاء، التجاوب، وتجربة الاستخدام بدقة عالية.",
    output: "Release Checks",
    icon: Bug,
    color: "#ff6b6b",
  },
  {
    title: "Deploy",
    titleAr: "النشر",
    description: "أجهز المشروع للنشر ومراقبة النسخة الإنتاجية بثقة واستقرار.",
    output: "Production Handoff",
    icon: Rocket,
    color: "#37d399",
  },
];

function StepCard({
  step,
  index,
  total,
}: {
  step: (typeof steps)[0];
  index: number;
  total: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="engineering-step-card group relative"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[inherit] opacity-60 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
        }}
      />

      {/* Card content */}
      <div className="relative p-5 md:p-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          {/* Step number */}
          <div className="flex items-center gap-3">
            <span
              dir="ltr"
              className="font-mono text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-md border"
              style={{
                color: step.color,
                borderColor: `color-mix(in srgb, ${step.color} 25%, transparent)`,
                background: `color-mix(in srgb, ${step.color} 6%, transparent)`,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            {/* Progress fraction */}
            <span className="text-[10px] font-mono text-muted-foreground/50 hidden sm:inline">
              {index + 1}/{total}
            </span>
          </div>

          {/* Icon */}
          <div
            className="engineering-icon-wrapper"
            style={{
              borderColor: `color-mix(in srgb, ${step.color} 30%, transparent)`,
              background: `color-mix(in srgb, ${step.color} 8%, transparent)`,
              // @ts-expect-error CSS custom property
              "--step-color": step.color,
            }}
          >
            <step.icon
              className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110"
              style={{ color: step.color }}
            />
          </div>
        </div>

        {/* Titles */}
        <div className="mb-3">
          <h3
            dir="ltr"
            className="font-mono text-sm font-bold tracking-wide"
            style={{ color: step.color }}
          >
            {step.title}
          </h3>
          <h4 className="text-base font-bold text-foreground mt-1">
            {step.titleAr}
          </h4>
        </div>

        {/* Description */}
        <p className="text-[13px] leading-[1.8] text-muted-foreground mb-5">
          {step.description}
        </p>

        {/* Output tag */}
        <div className="engineering-output-tag" style={{ "--step-color": step.color } as React.CSSProperties}>
          <div className="flex items-center gap-2">
            <ChevronLeft
              className="h-3 w-3"
              style={{ color: step.color }}
            />
            <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider">
              output
            </span>
          </div>
          <span
            dir="ltr"
            className="text-[11px] font-mono font-semibold"
            style={{ color: step.color }}
          >
            {step.output}
          </span>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, color-mix(in srgb, ${step.color} 6%, transparent), transparent 70%)`,
        }}
      />
    </motion.div>
  );
}

/* ── Pipeline connector arrows (horizontal, desktop only) ── */
function PipelineConnector({ index, color }: { index: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div
      ref={ref}
      className="hidden lg:flex items-center justify-center col-span-1"
    >
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={isInView ? { scaleX: 1, opacity: 1 } : undefined}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
        className="w-full h-[2px] origin-right"
        style={{
          background: `linear-gradient(270deg, ${color}, color-mix(in srgb, ${color} 20%, transparent))`,
        }}
      />
    </div>
  );
}

export function EngineeringProcess() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-border/50 bg-muted/5 py-16 md:py-20"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at center, color-mix(in srgb, var(--primary) 8%, transparent), transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <Container>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14 md:mb-16 max-w-2xl mx-auto"
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/40" />
            <p
              dir="ltr"
              className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary"
            >
              {"// Engineering Process"}
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/40" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold tracking-normal text-foreground md:text-3xl lg:text-4xl">
            طريقة عمل من{" "}
            <span className="gradient-text">التشخيص إلى الإنتاج</span>
          </h2>

          {/* Description */}
          <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base md:leading-8 max-w-xl mx-auto">
            عملية هندسية واضحة تربط التصميم والهندسة والنشر — حتى لا يبقى
            المشروع مجرد واجهة جميلة.
          </p>

          {/* Terminal-style process indicator */}
          <div
            dir="ltr"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 bg-[#071019] font-mono text-[11px] text-muted-foreground"
          >
            <span className="text-primary">$</span>
            <span>run</span>
            <span className="text-primary/80">--pipeline</span>
            <span className="text-warning">&quot;diagnose → deploy&quot;</span>
            <span className="inline-block w-1.5 h-4 bg-primary/70 animate-cursor-blink" />
          </div>
        </motion.div>

        {/* Steps grid — 3 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <StepCard
              key={step.title}
              step={step}
              index={index}
              total={steps.length}
            />
          ))}
        </div>

        {/* Bottom pipeline summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 md:mt-12"
        >
          {/* Horizontal pipeline visualization */}
          <div className="hidden md:flex items-center justify-center gap-0 max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center flex-1">
                {/* Node */}
                <div
                  className="engineering-pipeline-node"
                  style={{
                    borderColor: `color-mix(in srgb, ${step.color} 40%, transparent)`,
                    background: `color-mix(in srgb, ${step.color} 10%, transparent)`,
                    // @ts-expect-error CSS custom property
                    "--node-color": step.color,
                  }}
                  title={step.titleAr}
                >
                  <step.icon
                    className="h-3.5 w-3.5"
                    style={{ color: step.color }}
                  />
                </div>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className="flex-1 h-px"
                    style={{
                      background: `linear-gradient(270deg, color-mix(in srgb, ${steps[index + 1].color} 40%, transparent), color-mix(in srgb, ${step.color} 40%, transparent))`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Summary text */}
          <p
            dir="ltr"
            className="text-center mt-6 font-mono text-[11px] text-muted-foreground/50 tracking-wider"
          >
            DIAGNOSE → DESIGN → ARCHITECTURE → BUILD → QA → DEPLOY
          </p>
        </motion.div>
      </Container>
    </section>
  );
}
