"use client";

import type { Technology } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { TechnologyIcon } from "./TechnologyIcon";

interface TechNodeProps {
  technology: Technology;
  isActive: boolean;
  isFaded: boolean;
  onHover: (tech: Technology | null) => void;
  onClick?: (tech: Technology) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TechNode({
  technology,
  isActive,
  isFaded,
  onHover,
  onClick,
  className,
  size = "md",
}: TechNodeProps) {
  const initials = technology.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer",
        isFaded ? "opacity-35 grayscale-[50%]" : "opacity-100 grayscale-0",
        isActive ? "scale-110 z-10" : "hover:-translate-y-1 z-0",
        className
      )}
      onMouseEnter={() => onHover(technology)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick?.(technology)}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl border transition-all duration-300 shadow-sm",
          sizeClasses[size],
          isActive
            ? "border-primary/60 bg-primary/10 shadow-primary/20 shadow-lg"
            : "border-border/40 bg-card/40 hover:border-primary/40 hover:bg-card/80 hover:shadow-primary/10",
        )}
        style={technology.color && isActive ? { borderColor: technology.color, boxShadow: `0 4px 20px -2px ${technology.color}40` } : undefined}
      >
        <TechnologyIcon 
          technology={technology} 
          className="object-contain p-2.5 transition-transform group-hover:scale-110" 
          fallbackClassName="font-mono text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors" 
        />
      </div>
      
      <span 
        className={cn(
          "font-mono font-semibold transition-colors duration-300 text-center leading-tight whitespace-nowrap",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
          size === "sm" ? "text-[9px]" : "text-[10px]"
        )}
      >
        {technology.name}
      </span>
    </div>
  );
}
