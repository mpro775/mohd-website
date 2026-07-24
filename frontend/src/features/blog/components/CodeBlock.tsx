"use client";

import { useState } from "react";
import { Check, Copy, TriangleAlert } from "lucide-react";

export function CopyCodeButton({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 1600);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="blog-code-action"
      aria-label="نسخ الكود"
      aria-live="polite"
    >
      {state === "copied" ? (
        <Check className="h-3.5 w-3.5" />
      ) : state === "failed" ? (
        <TriangleAlert className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {state === "copied" ? "تم النسخ" : state === "failed" ? "تعذّر النسخ" : "نسخ"}
    </button>
  );
}
