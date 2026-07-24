import type { ReactNode } from "react";
import {
  parseBlogInlineTextOptions,
  type BlogInlineTextSize,
} from "../markdown/blog-format-contract";

export function BlogInlineText({
  children,
  mark,
  size,
}: {
  children: ReactNode;
  mark?: boolean | string;
  size?: BlogInlineTextSize | string;
}) {
  const options = parseBlogInlineTextOptions({ mark, size });
  return (
    <span
      data-blog-mark={options.mark ? "true" : "false"}
      data-blog-size={options.size}
      className={[
        "blog-inline-text",
        `blog-inline-size-${options.size}`,
        options.mark ? "blog-inline-mark" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}

