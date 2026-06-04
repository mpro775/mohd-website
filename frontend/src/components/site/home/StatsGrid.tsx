"use client";

import { Code2, Cpu, FileText, FolderGit2 } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { StaggerReveal, StaggerItem } from "./ScrollReveal";

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
            <div className="tech-card group p-5 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                <div className="h-px flex-1 mx-3 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>
              <AnimatedCounter
                value={stat.value}
                className="text-3xl font-mono font-bold text-foreground"
              />
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerReveal>
  );
}
