"use client";

import type { AutosaveState } from "../hooks/usePostAutosave";

const labels: Record<AutosaveState, string> = { idle: "محفوظ", dirty: "تغييرات غير محفوظة", saving: "جارٍ الحفظ…", saved: "تم الحفظ", error: "فشل الحفظ", conflict: "تعارض نسخة" };

export function EditorStatusBar({ state, savedAt, content }: { state: AutosaveState; savedAt: Date | null; content: string }) {
  const words = content.split(/\s+/).filter(Boolean).length;
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-2 text-xs text-muted-foreground"><span className={state === "error" || state === "conflict" ? "text-danger" : ""}>{labels[state]}{savedAt ? ` · ${savedAt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}` : ""}</span><span>{words} كلمة · {Math.max(1, Math.ceil(words / 200))} دقيقة قراءة</span></div>;
}
