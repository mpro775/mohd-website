import { describe, it, expect } from "vitest";
import { cn, formatDate, absoluteUrl, compact } from "./utils";

describe("Utils tests", () => {
  describe("cn helper", () => {
    it("should merge classes correctly", () => {
      expect(cn("a", "b")).toBe("a b");
      expect(cn("a", false && "b")).toBe("a");
      expect(cn("px-2 py-1", "p-4")).toBe("p-4"); // twMerge behavior
    });
  });

  describe("formatDate helper", () => {
    it("should format dates in Arabic correctly", () => {
      const date = "2026-06-02T16:00:00.000Z";
      const formatted = formatDate(date);
      expect(formatted).toContain("2026"); // Arabic formatting with standard numerals
      expect(formatted).toContain("يونيو"); // June in Arabic
    });

    it("should return empty string for undefined input", () => {
      expect(formatDate(undefined)).toBe("");
    });
  });

  describe("absoluteUrl helper", () => {
    it("should construct absolute url correctly", () => {
      expect(absoluteUrl("/test")).toBe("http://localhost:3001/test");
      expect(absoluteUrl("test")).toBe("http://localhost:3001/test");
    });
  });

  describe("compact helper", () => {
    it("should filter out falsy values", () => {
      const arr = [1, null, "hello", undefined, false, 0, "world"];
      expect(compact(arr)).toEqual([1, "hello", "world"]);
    });
  });
});
