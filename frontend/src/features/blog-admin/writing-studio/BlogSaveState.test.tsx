import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BlogSaveState } from "./BlogSaveState";

describe("BlogSaveState", () => {
  it.each([
    ["saving", "جارٍ الحفظ"],
    ["saved", "تم الحفظ"],
    ["error", "فشل الحفظ"],
  ] as const)("renders %s state", (state, label) => {
    const html = renderToStaticMarkup(
      <BlogSaveState state={state} savedAt={null} onRetry={vi.fn()} />,
    );
    expect(html).toContain(label);
    expect(html).toContain(`data-state="${state}"`);
  });
});
