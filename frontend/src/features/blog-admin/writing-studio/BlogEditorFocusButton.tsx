"use client";

import { Maximize2, Minimize2 } from "lucide-react";

export function BlogEditorFocusButton({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  const Icon = active ? Minimize2 : Maximize2;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold hover:bg-muted"
      aria-pressed={active}
      title="وضع التركيز (Ctrl/⌘ + Alt + F)"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{active ? "إنهاء التركيز" : "تركيز"}</span>
    </button>
  );
}
