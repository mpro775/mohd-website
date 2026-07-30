"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import type { Certification } from "@/lib/api/types";
import { SectionHeader } from "@/components/common/SectionHeader";
import { HomeCertificateCard } from "./HomeCertificateCard";

export function FeaturedCertifications({ items, title = "شهادات مميزة" }: { items: Certification[]; title?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    direction: "rtl",
    skipSnaps: false,
    dragFree: false
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  if (!items.length) return null;

  return (
    <section className="py-8">
      {/* Header Area */}
      <div className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <SectionHeader 
            eyebrow="Credentials" 
            title="تطور مهني موثّق" 
            className="mb-3" 
          />
          <p className="text-sm text-muted-foreground md:text-base leading-relaxed max-w-[90%]">
            شهادات واعتمادات توثّق رحلة تعلم مستمرة عبر التقنية، الإدارة والذكاء الاصطناعي.
          </p>
        </div>
        
        <div className="flex w-full flex-row items-center justify-between md:w-auto md:justify-end gap-6">
          <Link 
            href="/certifications" 
            className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
          >
            عرض جميع الشهادات
            <span className="rtl:inline-block ltr:hidden">↖</span>
            <span className="ltr:inline-block rtl:hidden">↗</span>
          </Link>
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2" dir="ltr">
            <button
              type="button"
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:border-foreground/20 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
              aria-label="السابق"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground hover:border-foreground/20 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
              aria-label="التالي"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slider Area */}
      <div className="overflow-hidden px-1 py-4 -mx-1" ref={emblaRef} dir="rtl">
        <div className="flex -ml-4" style={{ touchAction: "pan-y" }}>
          {items.map((item) => (
            <div 
              key={item.id ?? item.slug} 
              className="min-w-0 flex-none pl-4 w-[85%] sm:w-[60%] md:w-[45%] lg:w-[32%] xl:w-[28%]"
            >
              <HomeCertificateCard certification={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
