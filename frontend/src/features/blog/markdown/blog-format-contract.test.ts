import { describe, expect, it } from "vitest";
import {
  DEFAULT_BLOG_TEXT_BLOCK_OPTIONS,
  isBlogInlineTextSize,
  isBlogTextAlign,
  isBlogTextDirection,
  isBlogTextSize,
  parseBlogInlineTextOptions,
  parseBlogTextBlockOptions,
  serializeBlogInlineTextAttributes,
  serializeBlogTextBlockAttributes,
} from "./blog-format-contract";

describe("blog format contract", () => {
  it("accepts only allowlisted values", () => {
    expect(isBlogTextDirection("rtl")).toBe(true);
    expect(isBlogTextDirection("sideways")).toBe(false);
    expect(isBlogTextAlign("justify")).toBe(true);
    expect(isBlogTextAlign("left")).toBe(false);
    expect(isBlogTextSize("lead")).toBe(true);
    expect(isBlogInlineTextSize("lead")).toBe(false);
  });

  it("falls back safely and omits default attributes", () => {
    expect(
      parseBlogTextBlockOptions({
        dir: "invalid",
        align: "left",
        size: "100px",
      }),
    ).toEqual(DEFAULT_BLOG_TEXT_BLOCK_OPTIONS);
    expect(
      serializeBlogTextBlockAttributes(DEFAULT_BLOG_TEXT_BLOCK_OPTIONS),
    ).toEqual({});
    expect(
      serializeBlogTextBlockAttributes({
        dir: "rtl",
        align: "justify",
        size: "lg",
      }),
    ).toEqual({ dir: "rtl", align: "justify", size: "lg" });
  });

  it("normalizes inline mark and size without accepting lead", () => {
    expect(parseBlogInlineTextOptions({ mark: "true", size: "lead" })).toEqual({
      mark: true,
      size: "base",
    });
    expect(
      serializeBlogInlineTextAttributes({ mark: true, size: "xl" }),
    ).toEqual({ mark: "true", size: "xl" });
  });
});

