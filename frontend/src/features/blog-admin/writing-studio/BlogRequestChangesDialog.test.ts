import { describe, expect, it } from "vitest";
import { buildRequestChangesPayload } from "./BlogRequestChangesDialog";

describe("BlogRequestChangesDialog", () => {
  it("submits the existing message payload", () => {
    expect(buildRequestChangesPayload("  راجع المقدمة  ")).toEqual({
      message: "راجع المقدمة",
    });
  });
});
