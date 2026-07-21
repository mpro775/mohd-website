import GithubSlugger from "github-slugger";

export type TocHeading = { id: string; text: string; level: 2 | 3 };

export function extractHeadings(content: string): TocHeading[] {
  const slugger = new GithubSlugger();
  let inFence = false;
  const headings: TocHeading[] = [];
  for (const line of content.replace(/\r\n?/g, "\n").split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    const text = match[2].replace(/[*_`~\[\]]/g, "").trim();
    headings.push({ id: slugger.slug(text), text, level: match[1].length as 2 | 3 });
  }
  return headings;
}
