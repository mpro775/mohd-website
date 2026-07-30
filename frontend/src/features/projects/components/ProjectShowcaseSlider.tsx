"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ArrowLeft, ArrowUpLeft } from "lucide-react";
import { LinkButton } from "@/components/common/Button";
import type { Project } from "@/lib/api/types";

function fallbackImage(project: Project) {
  const category = `${project.category ?? ""} ${project.title}`.toLowerCase();
  if (category.includes("mobile")) return "/projects/fallback-mobile.svg";
  if (category.includes("dashboard") || category.includes("admin")) return "/projects/fallback-dashboard.svg";
  if (category.includes("api") || category.includes("backend")) return "/projects/fallback-api.svg";
  return "/projects/fallback-web.svg";
}

type ProjectShowcaseSliderProps = {
  projects: Project[];
};

export function ProjectShowcaseSlider({ projects }: ProjectShowcaseSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: false,
    direction: "rtl", // Assuming Arabic by default
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
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

  if (!projects?.length) return null;

  return (
    <div className="relative w-full">
      {/* Embla Carousel */}
      <div className="overflow-hidden" ref={emblaRef} dir="rtl">
        <div className="flex -ml-4 backface-hidden">
          {projects.map((project, index) => {
            const image = project.coverImageMedia?.url ?? project.coverImage ?? project.gallery?.[0] ?? fallbackImage(project);
            const num = (index + 1).toString().padStart(2, "0");
            const highlight = project.solution ?? project.results;

            return (
              <div
                key={project.slug}
                className="min-w-0 shrink-0 grow-0 basis-[90%] md:basis-[70%] lg:basis-[60%] pl-4"
              >
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]">
                  {/* Background Number */}
                  <div className="pointer-events-none absolute -right-4 -top-8 z-0 select-none opacity-[0.03] text-[180px] font-black leading-none text-foreground font-mono transition-opacity duration-300 group-hover:opacity-[0.05]">
                    {num}
                  </div>

                  <Link href={`/projects/${project.slug}`} className="block relative z-10 w-full aspect-[16/10] md:aspect-[16/9] overflow-hidden bg-muted">
                    <Image
                      src={image}
                      alt={project.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-80" />
                    
                    {/* Top Overlay info on image */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <span className="font-mono text-xs font-bold text-primary bg-background/80 backdrop-blur px-2.5 py-1 rounded-md border border-primary/20">
                        {num}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[10px] font-semibold text-foreground/80 bg-background/80 backdrop-blur px-2.5 py-1 rounded-md border border-border/50">
                        Case Study <ArrowUpLeft className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>

                  <div className="relative z-10 flex flex-1 flex-col p-6 pt-5">
                    {/* Metadata: Category & Status */}
                    <div className="flex items-center gap-3 text-[11px] font-mono font-bold tracking-wider text-muted-foreground uppercase mb-3">
                      <span className="text-primary/90">{project.category ?? "Product build"}</span>
                      <span>·</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            project.status === "in-progress" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                          }`}
                        />
                        <span className={project.status === "in-progress" ? "text-amber-500/90" : "text-emerald-500/90"}>
                          {project.status === "in-progress" ? "قيد التطوير" : "مكتمل"}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <Link href={`/projects/${project.slug}`} className="block group/link">
                      <h3 className="text-2xl font-bold text-foreground transition-colors group-hover/link:text-primary mb-2">
                        {project.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
                        {project.shortDescription}
                      </p>
                    </Link>

                    {/* Technologies */}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground/80">
                        {project.technologies.slice(0, 4).map((tech, i, arr) => (
                          <React.Fragment key={tech.slug}>
                            <span>{tech.name}</span>
                            {i < arr.length - 1 && <span>·</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-6">
                      {/* Highlight */}
                      {highlight && (
                        <div className="mb-4 rounded-lg border border-primary/10 bg-primary/5 p-3 transition-colors group-hover:border-primary/20">
                          <p className="text-[11px] font-semibold text-primary mb-1">النتيجة</p>
                          <p className="line-clamp-1 text-xs font-medium text-foreground/90">{highlight}</p>
                        </div>
                      )}

                      <LinkButton
                        href={`/projects/${project.slug}`}
                        variant="ghost"
                        className="w-full justify-between border border-border/50 bg-background/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30 group/btn"
                      >
                        <span>عرض دراسة الحالة</span>
                        <ArrowUpLeft className="h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                      </LinkButton>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slider Navigation */}
      <div className="mt-8 flex items-center justify-between px-2">
        {/* Progress & Count */}
        <div className="flex items-center gap-4">
          <div className="font-mono text-sm font-bold text-foreground">
            {(selectedIndex + 1).toString().padStart(2, "0")} <span className="text-muted-foreground/50">/</span> {projects.length.toString().padStart(2, "0")}
          </div>
          <div className="h-1 w-32 md:w-48 overflow-hidden rounded-full bg-border/50">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${((selectedIndex + 1) / projects.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2" dir="ltr">
          <button
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
            aria-label="Previous Project"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground"
            aria-label="Next Project"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
