"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button type="button" onClick={copy} className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-md border border-white/15 bg-zinc-900/90 px-2 py-1 text-xs text-zinc-200" aria-label="نسخ الكود">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "تم النسخ" : "نسخ"}
    </button>
  );
}
