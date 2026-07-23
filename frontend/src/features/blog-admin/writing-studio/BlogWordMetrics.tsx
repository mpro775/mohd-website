"use client";

import { EditorStatusBar } from "../editor/EditorStatusBar";

export function BlogWordMetrics({ content }: { content: string }) {
  return <EditorStatusBar content={content} />;
}
