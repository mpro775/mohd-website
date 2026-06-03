"use client";

import { useEffect, useState } from "react";

export function TerminalCard({ lines }: { lines: string[] }) {
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");

  useEffect(() => {
    if (currentLineIndex >= lines.length) return;

    const fullLine = lines[currentLineIndex];
    let charIndex = 0;
    
    setCurrentText("");

    const interval = setInterval(() => {
      if (charIndex < fullLine.length) {
        setCurrentText((prev) => prev + fullLine.slice(0, charIndex + 1));
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

  return (
    <div dir="ltr" className="relative overflow-hidden rounded-lg border border-border bg-[#071019] p-5 text-left font-mono text-sm shadow-2xl shadow-black/40">
      <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-muted-foreground/60 select-none">bash - mohd.dev</span>
      </div>
      
      <div className="space-y-2">
        {completedLines.map((line, idx) => (
          <p key={idx} className="text-muted-foreground">
            <span className="text-primary font-semibold">$</span> {line}
          </p>
        ))}
        
        {currentLineIndex < lines.length && (
          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">$</span> {currentText}
            <span className="ml-0.5 inline-block h-3.5 w-2 bg-primary align-middle animate-cursor-blink" />
          </p>
        )}

        {currentLineIndex >= lines.length && (
          <p className="text-primary/95 flex items-center gap-1.5">
            <span className="text-primary font-semibold">$</span> ready_for_work = true
            <span className="ml-0.5 inline-block h-3.5 w-2 bg-primary align-middle animate-cursor-blink" />
          </p>
        )}
      </div>
    </div>
  );
}
