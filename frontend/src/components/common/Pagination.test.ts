import { describe, expect, it } from "vitest";
import { buildPaginationHref } from "./Pagination";

describe("blog pagination", () => {
  it("keeps search, category and tag parameters", () => {
    const href = buildPaginationHref("/blog", 3, { search: "nestjs", category: "backend", tag: "mongodb" });
    expect(href).toContain("page=3");
    expect(href).toContain("search=nestjs");
    expect(href).toContain("category=backend");
    expect(href).toContain("tag=mongodb");
  });
});
