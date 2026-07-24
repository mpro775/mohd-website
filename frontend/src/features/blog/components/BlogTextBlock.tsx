import type { ReactNode } from "react";
import {
  parseBlogTextBlockOptions,
  type BlogTextAlign,
  type BlogTextDirection,
  type BlogTextSize,
} from "../markdown/blog-format-contract";

export function BlogTextBlock({
  children,
  dir,
  align,
  size,
}: {
  children: ReactNode;
  dir?: BlogTextDirection | string;
  align?: BlogTextAlign | string;
  size?: BlogTextSize | string;
}) {
  const options = parseBlogTextBlockOptions({ dir, align, size });
  return (
    <div
      dir={options.dir}
      data-blog-dir={options.dir}
      data-blog-align={options.align}
      data-blog-size={options.size}
      className={[
        "blog-text-block",
        `blog-text-dir-${options.dir}`,
        `blog-text-align-${options.align}`,
        `blog-text-size-${options.size}`,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

