"use client";

import { motion } from "framer-motion";
import { Check, Database, List, Terminal } from "lucide-react";
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
      className="relative z-10 animate-fade-in"
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
      className="relative flex items-center justify-center w-full"
    >
      {children}
    </motion.div>
  );
}

export function CodeTerminalCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: [-4, 4, -4],
      }}
      transition={{
        y: {
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        },
        opacity: { duration: 0.5 },
      }}
      className="w-[280px] bg-[#070f16]/90 border border-border/80 rounded-xl p-4 shadow-2xl backdrop-blur-md font-mono text-[11px] leading-5 select-none text-muted-foreground"
      dir="ltr"
    >
      <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
        </div>
        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
          <Terminal className="h-3 w-3 text-primary/70" /> app.controller.ts
        </span>
      </div>
      <div className="space-y-1">
        <div>
          <span className="text-secondary">@Get</span>
          <span className="text-foreground">(</span>
          <span className="text-success">&apos;projects&apos;</span>
          <span className="text-foreground">)</span>
        </div>
        <div className="pl-3">
          <span className="text-primary">async</span> <span className="text-foreground">getProjects() &#123;</span>
        </div>
        <div className="pl-6 text-foreground/80">
          <span className="text-secondary">return</span> <span className="text-primary">this</span>
          .projectsService.findAll();
        </div>
        <div className="pl-3 text-foreground">&#125;</div>

        <div className="pt-1.5">
          <span className="text-secondary">@Post</span>
          <span className="text-foreground">(</span>
          <span className="text-success">&apos;contact&apos;</span>
          <span className="text-foreground">)</span>
        </div>
        <div className="pl-3">
          <span className="text-primary">async</span> <span className="text-foreground">sendMessage(@Body() dto) &#123;</span>
        </div>
        <div className="pl-6 text-foreground/80">
          <span className="text-secondary">return</span> <span className="text-primary">this</span>
          .contactService.create(dto);
        </div>
        <div className="pl-3 text-foreground">&#125;</div>
      </div>
    </motion.div>
  );
}

export function DeploymentCard() {
  const steps = [
    { label: "Building application...", done: true },
    { label: "Running tests...", done: true },
    { label: "Optimizing assets...", done: true },
    { label: "Deploying to production...", done: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: [4, -4, 4],
      }}
      transition={{
        y: {
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        },
        opacity: { duration: 0.5 },
      }}
      className="w-[230px] bg-[#070f16]/90 border border-success/30 rounded-xl p-4 shadow-2xl backdrop-blur-md font-mono text-[11px] leading-5 select-none text-muted-foreground"
      dir="ltr"
    >
      <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
          deployment.sh
        </span>
        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-foreground/80">
            <Check className="h-3.5 w-3.5 text-success shrink-0" />
            <span>{s.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-success font-semibold pt-1 border-t border-border/20">
          <Check className="h-4 w-4 shrink-0" />
          <span>Deployed successfully</span>
        </div>
      </div>
    </motion.div>
  );
}

export function DatabaseSchemaCard() {
  const tables = [
    "users",
    "projects",
    "services",
    "blog_posts",
    "contact_messages",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: [-5, 5, -5],
      }}
      transition={{
        y: {
          duration: 6.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
        opacity: { duration: 0.5 },
      }}
      className="w-[200px] bg-[#070f16]/90 border border-border/80 rounded-xl p-4 shadow-2xl backdrop-blur-md font-mono text-[11px] leading-5 select-none text-muted-foreground"
      dir="ltr"
    >
      <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2 text-foreground">
        <Database className="h-4 w-4 text-primary" />
        <div>
          <div className="text-[9px] text-muted-foreground leading-none">database</div>
          <div className="text-xs font-bold text-success leading-tight">PostgreSQL</div>
        </div>
      </div>
      <div className="space-y-1.5">
        {tables.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors">
            <List className="h-3 w-3 text-muted-foreground/60" />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function ApiStatusCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: [5, -5, 5],
      }}
      transition={{
        y: {
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        },
        opacity: { duration: 0.5 },
      }}
      className="w-[180px] bg-[#070f16]/90 border border-border/80 rounded-xl p-4 shadow-2xl backdrop-blur-md font-mono select-none"
      dir="ltr"
    >
      <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">API STATUS</span>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[9px] text-success font-semibold uppercase">ONLINE</span>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-success tracking-tight">200</span>
        <span className="text-xs text-muted-foreground font-semibold">OK</span>
      </div>
      
      {/* Mini Chart Graph */}
      <div className="mt-4 flex items-end gap-1 h-8">
        {[40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 100].map((val, idx) => (
          <div
            key={idx}
            className="flex-1 bg-gradient-to-t from-primary/20 to-primary rounded-sm"
            style={{ height: `${val}%` }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function WireframeGlobeWidget() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex items-center gap-4 select-none font-mono"
      dir="ltr"
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        {/* Animated grid globe */}
        <svg viewBox="0 0 100 100" className="w-full h-full text-primary/15 animate-spin-slow">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <ellipse cx="50" cy="50" rx="45" ry="15" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <ellipse cx="50" cy="50" rx="15" ry="45" fill="none" stroke="currentColor" strokeWidth="0.6" />
          <ellipse cx="50" cy="50" rx="45" ry="30" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <ellipse cx="50" cy="50" rx="30" ry="45" fill="none" stroke="currentColor" strokeWidth="0.4" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.4" />
          <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.4" />
        </svg>

        {/* Pulsing Green Marker */}
        <div className="absolute top-[35%] left-[60%] flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-[10px] font-bold text-success tracking-widest uppercase">FROM IDEA</div>
        <div className="text-[10px] font-bold text-success tracking-widest uppercase">TO PRODUCTION</div>
      </div>
    </motion.div>
  );
}

export function FloatingCodeBadge() {
  return (
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="flex items-center justify-center w-12 h-12 rounded-lg bg-[#070f16] border border-primary/50 text-primary text-base font-bold shadow-lg shadow-primary/10"
    >
      &lt;/&gt;
    </motion.div>
  );
}
