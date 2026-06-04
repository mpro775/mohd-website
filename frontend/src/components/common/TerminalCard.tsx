"use client";

import { useEffect, useState } from "react";

export function TerminalCard({
  lines,
  title = "bash - mohd.dev",
  finalLine = "ready_for_work = true",
}: {
  lines: string[];
  title?: string;
  finalLine?: string;
}) {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const fullLine = lines[currentLineIndex];
    let charIndex = 0;
    
    // Avoid synchronous state changes directly in the effect body
    Promise.resolve().then(() => setCurrentText(""));

    const interval = setInterval(() => {
      if (charIndex < fullLine.length) {
        setCurrentText(fullLine.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCompletedLines((prev) => [...prev, fullLine]);
          setCurrentLineIndex((prev) => prev + 1);
        }, 700);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [currentLineIndex, lines]);

  // Different output colors for each completed line
  const lineColors = [
    "text-emerald-400/90",
    "text-sky-400/90",
    "text-amber-300/90",
    "text-purple-400/90",
    "text-rose-400/90",
  ];

  return (
    <div dir="ltr" className="terminal-scanline relative overflow-hidden rounded-lg border border-border bg-[#071019] p-5 text-left font-mono text-sm shadow-2xl shadow-black/40">
      {/* Top accent gradient line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/40 via-secondary/20 to-transparent" />
      
      {/* Subtle ambient glow inside terminal */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      
      <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.4)]" />
          <span className="h-3 w-3 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.4)]" />
        </div>
        <span className="text-xs text-muted-foreground/60 select-none">{title}</span>
      </div>
      
      <div className="space-y-2">
        {completedLines.map((line, idx) => (
          <div key={idx} className="space-y-0.5">
            <p className="text-muted-foreground">
              <span className="text-primary font-semibold">$</span> {line}
            </p>
            {/* Simulated output line */}
            <p className={`text-[11px] ${lineColors[idx % lineColors.length]} opacity-80 pl-3`}>
              ✓ {line.includes("build") ? "compiled successfully" : line.includes("typecheck") ? "no errors found" : "done"}
            </p>
          </div>
        ))}
        
        {currentLineIndex < lines.length && (
          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">$</span> {currentText}
            <span className="ml-0.5 inline-block h-3.5 w-2 bg-primary align-middle animate-cursor-blink" />
          </p>
        )}

        {currentLineIndex >= lines.length && finalLine && (
          <p className="text-primary/95 flex items-center gap-1.5 mt-2 pt-2 border-t border-border/20">
            <span className="text-primary font-semibold">$</span> {finalLine}
            <span className="ml-0.5 inline-block h-3.5 w-2 bg-primary align-middle animate-cursor-blink" />
          </p>
        )}
      </div>
    </div>
  );
}
