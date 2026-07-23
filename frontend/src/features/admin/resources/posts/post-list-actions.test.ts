import { describe, expect, it } from "vitest";
import {
  buildBulkTaxonomyPayload,
  matchesPermanentDeleteTitle,
} from "./post-list-actions";

describe("post bulk dialogs", () => {
  it("does not build a mutation before an item is selected", () => {
    expect(buildBulkTaxonomyPayload("category", ["1"], "")).toBeNull();
  });

  it("preserves the existing category and tag payload shapes", () => {
    expect(buildBulkTaxonomyPayload("category", ["1"], "cat")).toEqual({
      action: "set-category",
      ids: ["1"],
      data: { categoryId: "cat" },
    });
    expect(buildBulkTaxonomyPayload("tag", ["1"], "tag")).toEqual({
      action: "add-tag",
      ids: ["1"],
      data: { tagId: "tag" },
    });
  });

  it("requires an exact title for permanent deletion", () => {
    expect(matchesPermanentDeleteTitle("مقال", "مقال")).toBe(true);
    expect(matchesPermanentDeleteTitle("مقال", " مقال ")).toBe(false);
  });
});
