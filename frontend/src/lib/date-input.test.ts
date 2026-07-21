import { describe, expect, it } from "vitest";
import { formatSafeDate, toDateInputValue } from "./date-input";

describe("date input helpers", () => {
  it("converts ISO values to yyyy-MM-dd", () => {
    expect(toDateInputValue("2026-05-15T12:30:00.000Z")).toBe("2026-05-15");
  });

  it("never returns Invalid Date", () => {
    expect(toDateInputValue("not-a-date")).toBe("");
    expect(formatSafeDate("not-a-date")).toBe("غير محدد");
  });
});
