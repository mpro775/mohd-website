"use client";

import { Code2, Rocket, Users, Sparkles } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { StaggerItem, StaggerReveal } from "./ScrollReveal";

const iconMap = {
  Rocket,
  Code2,
  Users,
  Sparkles,
} as const;

type IconName = keyof typeof iconMap;

type Stat = {
  label: string;
  value: number;
  suffix?: string;
  iconName: IconName;
};

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <StaggerReveal className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.iconName];
        return (
          <StaggerItem key={stat.label}>
            <div className="premium-card group p-5 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center justify-center text-center">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-shimmer bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
              <div className="mb-3 flex justify-center">
                <Icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
              </div>
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                className="font-mono text-3xl font-bold text-foreground tracking-tight"
              />
              <p className="mt-2 font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerReveal>
  );
}
