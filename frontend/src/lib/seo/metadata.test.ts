import { describe, expect, it } from "vitest";
import { buildPostMetadata } from "./metadata";

describe("post metadata", () => {
  it("uses the custom canonical and article Open Graph type", () => {
    const metadata = buildPostMetadata({ title: "Post", slug: "post", summary: "Summary", content: "Content", canonicalUrl: "https://canonical.example/post", publishedAt: "2026-01-01T00:00:00Z", allowIndexing: true });
    expect(metadata.alternates?.canonical).toBe("https://canonical.example/post");
    expect((metadata.openGraph as { type?: string })?.type).toBe("article");
  });
});
