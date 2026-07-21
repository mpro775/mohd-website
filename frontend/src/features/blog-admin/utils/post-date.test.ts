import { describe, expect, it } from "vitest";
import { datetimeLocalToUtc } from "./post-date";

describe("post scheduling dates", () => {
  it("converts datetime-local input to an ISO UTC instant", () => {
    expect(datetimeLocalToUtc("2026-07-22T15:30")).toMatch(/^2026-07-22T\d{2}:30:00\.000Z$/);
  });
});
