import { describe, expect, it } from "vitest";
import { buildMediaMarkdown } from "./EditorMediaDialog";

describe("editor media insertion", () => {
  it("requires alt text and emits safe markdown", () => {
    expect(() => buildMediaMarkdown("https://media.example/image.webp", "")).toThrow();
    expect(buildMediaMarkdown("https://media.example/image.webp", "وصف الصورة")).toContain("![وصف الصورة]");
    expect(buildMediaMarkdown("https://media.example/image.webp", "وصف", "تعليق")).toContain(":::figure");
  });
});
