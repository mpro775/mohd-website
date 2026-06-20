"use client";

import { motion } from "framer-motion";
import { FloatingParticles } from "./FloatingParticles";
import { TypingEffect } from "./TypingEffect";

type HeroBadgeProps = {
  text: string;
  isAvailable: boolean;
};

export function HeroBadge({ text, isAvailable }: HeroBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      dir="ltr"
      className="mb-4 inline-flex items-center"
    >
      <span
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs ${
          isAvailable
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-secondary/30 bg-secondary/10 text-secondary"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
              isAvailable ? "bg-primary" : "bg-secondary"
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isAvailable ? "bg-primary" : "bg-secondary"
            }`}
          />
        </span>
        {text}
      </span>
    </motion.div>
  );
}

export function HeroTypingSubtitle() {
  return (
    <div dir="ltr" className="mb-2 font-mono text-xs text-muted-foreground/60">
      {"// "}
      <TypingEffect
        phrases={[
          "Personal Engineering OS",
          "Full-stack products from UI to production",
          "Clean architecture - thoughtful UX - stable APIs",
          "Turning ideas into production-ready software",
        ]}
        typingSpeed={50}
        deletingSpeed={25}
        pauseDuration={2500}
      />
    </div>
  );
}

export function HeroParticles() {
  return <FloatingParticles count={14} />;
}

export function HeroContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10"
    >
      {children}
    </motion.div>
  );
}

export function HeroVisual({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex items-center justify-center"
    >
      {children}
    </motion.div>
  );
}
