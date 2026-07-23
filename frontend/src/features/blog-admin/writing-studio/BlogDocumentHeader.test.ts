import { describe, expect, it } from "vitest";
import { slugFromTitle } from "./BlogDocumentHeader";

describe("BlogDocumentHeader slug generation", () => {
  it("generates an editable Arabic and English slug", () => {
    expect(slugFromTitle("  بناء API متين with NestJS  ")).toBe(
      "بناء-api-متين-with-nestjs",
    );
  });
});
