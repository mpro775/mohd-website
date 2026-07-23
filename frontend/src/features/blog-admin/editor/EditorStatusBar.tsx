"use client";

export function EditorStatusBar({ content }: { content: string }) {
  const words = content.split(/\s+/).filter(Boolean).length;
  const characters = content.length;
  const headings = content.split("\n").filter((line) => /^#{1,6}\s/.test(line)).length;
  return <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border px-4 py-3 text-xs text-muted-foreground"><span>{words.toLocaleString("ar-SA")} كلمة</span><span aria-hidden>·</span><span>{characters.toLocaleString("ar-SA")} حرفًا</span><span aria-hidden>·</span><span>{Math.max(1, Math.ceil(words / 200))} دقائق قراءة</span><span aria-hidden>·</span><span>{headings} عناوين</span></div>;
}
