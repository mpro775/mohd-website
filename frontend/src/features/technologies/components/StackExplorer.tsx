"use client";

import { useState, useMemo, useEffect } from "react";
import { ExternalLink, X } from "lucide-react";
import type { Technology } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { TechNode } from "./TechNode";

interface StackExplorerProps {
  technologies: Technology[];
}

const CATEGORIES = [
  { id: "all", label: "الكل" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "database", label: "Data" },
  { id: "devops", label: "DevOps" },
  { id: "cloud", label: "Cloud" },
  { id: "ai", label: "AI" },
];

const SpotlightPanel = ({ tech, isMobileSheet = false, onClose }: { tech: Technology; isMobileSheet?: boolean; onClose?: () => void }) => {
  if (!tech) return null;
  
  return (
    <div 
      className={cn(
        "w-full rounded-2xl border border-primary/20 bg-[#070d12]/95 backdrop-blur-md p-6 relative overflow-hidden transition-all duration-300",
        isMobileSheet ? "shadow-2xl shadow-primary/20" : "min-h-[220px]"
      )}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      
      {isMobileSheet && onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground bg-card rounded-full"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 dir="ltr" className="font-mono text-xl font-bold text-foreground mb-1 text-right">
            {tech.name}
          </h3>
          <p className="text-primary font-mono text-xs font-semibold text-right">
            {tech.highlighted ? "Core Technology" : "Frequently Used"}
            {tech.yearsOfExperience ? ` • ${tech.yearsOfExperience}+ Years` : ""}
          </p>
        </div>
        
        <div dir="ltr" className="flex h-14 w-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-mono text-lg font-bold text-primary shrink-0">
          {tech.iconMedia ? (
            <img src={tech.iconMedia.url} alt={tech.name} className="w-8 h-8 object-contain" />
          ) : tech.icon ? (
            <div dangerouslySetInnerHTML={{ __html: tech.icon }} className="w-8 h-8 [&>svg]:w-full [&>svg]:h-full flex items-center justify-center" />
          ) : (
            tech.name.substring(0, 2).toUpperCase()
          )}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground mb-6 text-right">
        {tech.description || "لم يتم إضافة وصف لهذه التقنية بعد."}
      </p>

      {tech.officialUrl && (
        <div className="flex justify-start">
          <a 
            href={tech.officialUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-primary hover:text-primary/80 transition-colors uppercase tracking-wider font-bold"
          >
            Documentation <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
};

export function StackExplorer({ technologies }: StackExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [hoveredTech, setHoveredTech] = useState<Technology | null>(null);
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleHover = (tech: Technology | null) => {
    if (!isMobile) {
      setHoveredTech(tech);
    }
  };

  const handleClick = (tech: Technology) => {
    if (isMobile) {
      setSelectedTech(tech);
    }
  };

  const activeTech = hoveredTech || selectedTech;

  // Group technologies for Architecture View (All)
  const groupedTechs = useMemo(() => {
    return CATEGORIES.filter((c) => c.id !== "all").map((cat) => ({
      ...cat,
      items: technologies
        .filter((t) => t.category === cat.id)
        .sort((a, b) => (a.order || 99) - (b.order || 99) || (b.highlighted ? 1 : 0) - (a.highlighted ? 1 : 0)),
    })).filter(g => g.items.length > 0);
  }, [technologies]);

  // Filter for single category view
  const displayTechs = useMemo(() => {
    if (activeCategory === "all") return [];
    return technologies
      .filter((t) => t.category === activeCategory)
      .sort((a, b) => (a.order || 99) - (b.order || 99) || (b.highlighted ? 1 : 0) - (a.highlighted ? 1 : 0));
  }, [technologies, activeCategory]);



  return (
    <div className="w-full flex flex-col gap-8 md:gap-12 relative">
      {/* Category Filter */}
      <div className="flex items-center justify-center">
        <div className="flex flex-wrap justify-center gap-1 p-1 bg-card/40 border border-border/50 rounded-2xl backdrop-blur-sm max-w-full overflow-x-auto hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-mono transition-all duration-300 whitespace-nowrap",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Explorer Area */}
        <div className="w-full lg:w-[65%] flex-shrink-0 flex flex-col gap-8 relative min-h-[400px]">
          {activeCategory === "all" ? (
            <div className="flex flex-col gap-8 w-full">
              {groupedTechs.map((group) => (
                <div key={group.id} className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <h4 className="font-mono text-[10px] font-bold text-muted-foreground tracking-widest uppercase w-24 shrink-0 text-left">
                      {group.label}
                    </h4>
                    <div className="h-px bg-border/50 flex-1" />
                  </div>
                  
                  <div className="flex flex-wrap gap-4 md:gap-6 justify-start pl-0 md:pl-28">
                    {group.items.map((tech) => (
                      <TechNode
                        key={tech.slug}
                        technology={tech}
                        isActive={activeTech?.slug === tech.slug}
                        isFaded={activeTech !== null && activeTech?.slug !== tech.slug}
                        onHover={handleHover}
                        onClick={handleClick}
                        size={tech.highlighted ? "lg" : "md"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center md:justify-start items-center w-full min-h-[300px] content-start">
              {displayTechs.map((tech) => (
                <TechNode
                  key={tech.slug}
                  technology={tech}
                  isActive={activeTech?.slug === tech.slug}
                  isFaded={activeTech !== null && activeTech?.slug !== tech.slug}
                  onHover={handleHover}
                  onClick={handleClick}
                  size={tech.highlighted ? "lg" : "md"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop Spotlight */}
        <div className="hidden lg:block w-full lg:w-[35%] sticky top-24">
          <div className={cn(
            "transition-all duration-500",
            activeTech ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          )}>
            {activeTech && <SpotlightPanel tech={activeTech} />}
          </div>
          
          {!activeTech && (
            <div className="h-full min-h-[220px] rounded-2xl border border-dashed border-border/40 flex items-center justify-center p-6 text-center text-muted-foreground/50 font-mono text-sm">
              Hover over any technology to explore details
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Sheet (Spotlight) */}
      {isMobile && selectedTech && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-background/80 backdrop-blur-sm sm:items-center">
          <div className="absolute inset-0" onClick={() => setSelectedTech(null)} />
          <div className="relative w-full max-w-md animate-in slide-in-from-bottom-10 fade-in duration-300">
            <SpotlightPanel tech={selectedTech} isMobileSheet={true} onClose={() => setSelectedTech(null)} />
          </div>
        </div>
      )}

    </div>
  );
}
