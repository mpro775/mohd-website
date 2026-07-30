"use client";

import { useRef, useState, MouseEvent } from "react";
import { ArrowUpLeft, Check, Code2, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Service } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function getServiceMeta(service: Service) {
  const text = `${service.name} ${service.shortDescription}`.toLowerCase();
  
  if (text.includes("web") || text.includes("ويب") || text.includes("تطبيقات")) {
    return {
      title: "تطبيقات الويب المتكاملة",
      description: "أحوّل الأفكار إلى تطبيقات ويب متكاملة، من الواجهة وتجربة المستخدم إلى الـ Backend والبنية التحتية.",
      techChips: ["NEXT.JS", "NESTJS", "POSTGRESQL"],
      Icon: Code2,
    };
  }
  if (text.includes("saas") || text.includes("منصات") || text.includes("dashboard")) {
    return {
      title: "منصات SaaS",
      description: "بناء منصات قابلة للنمو تشمل الاشتراكات، الصلاحيات، تعدد العملاء، والعمليات الخلفية.",
      techChips: ["NEXT.JS", "NESTJS", "REDIS", "POSTGRESQL"],
      Icon: Layers,
    };
  }
  if (text.includes("ai") || text.includes("ذكاء")) {
    return {
      title: "حلول AI",
      description: "دمج الذكاء الاصطناعي داخل منتجات حقيقية باستخدام المساعدات الذكية والأتمتة وربط بيانات الأعمال.",
      techChips: ["AI", "RAG", "APIs"],
      Icon: Sparkles,
    };
  }
  
  // Default fallback
  return {
    title: service.name,
    description: service.shortDescription,
    techChips: ["FULL-STACK", "UI/UX", "API"],
    Icon: Code2,
  };
}

export function ServiceCard({ service, index = 0, isFeatured = false }: { service: Service; index?: number; isFeatured?: boolean }) {
  const meta = getServiceMeta(service);
  const Icon = meta.Icon;
  const numString = (index + 1).toString().padStart(2, '0');
  
  const divRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <article 
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border bg-card/40 p-6 transition-all duration-500",
        isHovered ? "border-primary/30 -translate-y-[6px]" : "border-border/60",
        isFeatured && !isHovered ? "-translate-y-4" : ""
      )}
    >
      {/* Spotlight Effect */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(16,185,129,0.06), transparent 40%)`
        }}
      />

      {/* Large Background Number */}
      <div className="pointer-events-none absolute -bottom-10 -right-4 z-0 select-none text-[160px] font-bold leading-none text-foreground opacity-[0.025]">
        {numString}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Top Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-radial-gradient from-primary/10 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.05)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-background/50 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
              <ArrowUpLeft className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]" />
            </div>
            {isFeatured && (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold tracking-wider text-primary shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                MOST REQUESTED
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-foreground">{meta.title}</h3>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground/90">{meta.description}</p>
        </div>

        {/* Tech Chips */}
        <div className="mt-6 flex flex-wrap gap-1.5">
          {meta.techChips.map((chip) => (
            <span key={chip} dir="ltr" className="rounded border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-primary/80">
              {chip}
            </span>
          ))}
        </div>

        {/* Deliverables */}
        {service.deliverables?.length ? (
          <ul className="mt-6 space-y-2.5 border-t border-border/40 pt-5 text-sm text-muted-foreground/80">
            {service.deliverables.slice(0, 4).map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-primary/70" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Footer: Duration & CTA */}
        <div className="mt-8 flex items-center justify-between border-t border-border/40 pt-5">
          <div dir="ltr" className="font-mono text-xs text-muted-foreground/60">
            {service.duration ? `${service.duration}` : "TBD"}
          </div>
          
          <Link href={`/services/${service.slug}`} className="group/cta flex items-center gap-1.5 text-sm font-bold text-primary">
            <div className="relative">
              <span>اكتشف الخدمة</span>
              <span className="absolute -bottom-1 right-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover/cta:w-full" />
            </div>
            <ArrowUpLeft className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-x-1 group-hover/cta:-translate-y-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
