import type { PostEditorValues } from "../schemas/post-editor.schema";

export type StoredEditorDraft = { timestamp: number; version: number; values: PostEditorValues };

export function draftStorageKey(postId: string, userId = "current"): string {
  return `blog-editor:${userId}:${postId || "new"}`;
}

export function saveEditorDraft(key: string, draft: StoredEditorDraft): void {
  localStorage.setItem(key, JSON.stringify(draft));
}

export function loadEditorDraft(key: string): StoredEditorDraft | null {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as StoredEditorDraft : null;
  } catch { return null; }
}

export function clearEditorDraft(key: string): void { localStorage.removeItem(key); }
