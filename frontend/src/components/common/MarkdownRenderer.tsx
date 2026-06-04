"use client";

import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

const components = {
  a: ({ href, children, ...props }: any) => {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  },
  pre: ({ children, ...props }: any) => (
    <pre dir="ltr" className="text-left" {...props}>
      {children}
    </pre>
  ),
  code: ({ children, ...props }: any) => (
    <code dir="ltr" className="text-left font-mono" {...props}>
      {children}
    </code>
  ),
};

export function MarkdownRenderer({ content }: { content?: string }) {
  if (!content) return null;
  return (
    <article className="prose-tech">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
