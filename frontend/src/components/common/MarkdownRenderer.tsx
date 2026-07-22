import { MarkdownAsync } from "react-markdown";
import {
  markdownComponents,
  markdownRehypePlugins,
  markdownRemarkPlugins,
} from "./markdown-config";

export async function MarkdownRenderer({ content }: { content?: string }) {
  if (!content) return null;

  return (
    <article className="prose-tech">
      <MarkdownAsync
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={markdownRehypePlugins}
        components={markdownComponents}
      >
        {content}
      </MarkdownAsync>
    </article>
  );
}
