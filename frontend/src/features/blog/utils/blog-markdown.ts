import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import GithubSlugger from "github-slugger";
import type { Heading, Root } from "mdast";

export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export function extractHeadings(content: string): TocHeading[] {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(content) as Root;

  const slugger = new GithubSlugger();
  const headings: TocHeading[] = [];

  visit(tree, "heading", (node: Heading) => {
    if (node.depth !== 2 && node.depth !== 3) return;

    const text = toString(node).trim();
    if (!text) return;

    headings.push({
      text,
      id: slugger.slug(text),
      level: node.depth,
    });
  });

  return headings;
}
