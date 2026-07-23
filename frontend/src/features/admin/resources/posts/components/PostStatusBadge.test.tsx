import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PostStatus } from "@/lib/api/types";
import { PostStatusBadge, postStatusConfig } from "./PostStatusBadge";

describe("PostStatusBadge", () => {
  it.each(Object.keys(postStatusConfig) as PostStatus[])(
    "renders the label and state for %s",
    (status) => {
      const html = renderToStaticMarkup(<PostStatusBadge status={status} />);
      expect(html).toContain(postStatusConfig[status].label);
      expect(html).toContain(`data-status="${status}"`);
    },
  );
});
