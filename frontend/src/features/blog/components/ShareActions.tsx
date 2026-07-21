"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareActions({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(window.location.href); setCopied(true); window.setTimeout(() => setCopied(false), 1500); };
  const share = async () => { if (navigator.share) await navigator.share({ title, url: window.location.href }); else await copy(); };
  return <div className="flex flex-wrap gap-2"><button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><Share2 className="h-4 w-4" />مشاركة</button><button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "تم النسخ" : "نسخ الرابط"}</button></div>;
}
