"use client";

import { Code2, Cpu, FileText, FolderGit2 } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { StaggerItem, StaggerReveal } from "./ScrollReveal";

const iconMap = {
  Cpu,
  FolderGit2,
  FileText,
  Code2,
} as const;

type IconName = keyof typeof iconMap;

type Stat = {
  label: string;
  value: number;
  iconName: IconName;
};

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <StaggerReveal className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.iconName];
        return (
          <StaggerItem key={stat.label}>
            <div className="premium-card group p-5 transition-all duration-300 hover:-translate-y-1">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-shimmer bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
              <div className="mb-4 flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div className="mx-3 h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              <AnimatedCounter
                value={stat.value}
                className="font-mono text-3xl font-bold text-foreground"
              />
              <p dir="ltr" className="mt-1 font-mono text-xs text-muted-foreground">
                {stat.label}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-primary to-secondary" />
              </div>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerReveal>
  );
}
