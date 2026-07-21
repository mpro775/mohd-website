import type { ReactNode } from "react";
import Link from "next/link";
import { MarkdownAsync } from "react-markdown";
import { defaultSchema } from "hast-util-sanitize";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize from "rehype-sanitize";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import GithubSlugger from "github-slugger";
import { AlertCircle, Info, Lightbulb, TriangleAlert } from "lucide-react";
import { CopyCodeButton } from "@/features/blog/components/CodeBlock";

const calloutTypes = new Set(["note", "tip", "warning", "danger"]);

function allowedMediaSource(src: string): boolean {
  const configured = process.env.NEXT_PUBLIC_MEDIA_URL;
  return src.startsWith("/") || Boolean(configured && src.startsWith(`${configured.replace(/\/$/, "")}/`));
}

function remarkSafeDirectives() {
  return (tree: any) => {
    const visit = (node: any) => {
      if (node?.type === "containerDirective") {
        if (calloutTypes.has(node.name)) {
          node.data = { ...(node.data ?? {}), hName: "aside", hProperties: { "data-callout": node.name } };
        } else if (node.name === "figure") {
          const { src, alt } = node.attributes ?? {};
          if (typeof src === "string" && typeof alt === "string" && alt.trim()) {
            node.data = { ...(node.data ?? {}), hName: "figure", hProperties: { "data-src": src, "data-alt": alt } };
          } else {
            node.type = "paragraph";
          }
        } else {
          node.type = "paragraph";
          delete node.data;
        }
      }
      for (const child of node?.children ?? []) visit(child);
    };
    visit(tree);
  };
}

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "id"],
    aside: ["dataCallout"],
    figure: ["dataSrc", "dataAlt"],
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: ["http", "https", "mailto"],
    src: ["http", "https"],
  },
};

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) return textOf((node as any).props.children);
  return "";
}

const icons = {
  note: Info,
  tip: Lightbulb,
  warning: TriangleAlert,
  danger: AlertCircle,
};

export async function MarkdownRenderer({ content }: { content?: string }) {
  if (!content) return null;
  const slugger = new GithubSlugger();
  const heading = (Tag: "h2" | "h3") => {
    function MarkdownHeading({ children, ...props }: any) {
      const id = slugger.slug(textOf(children));
      return <Tag id={id} className="scroll-mt-28" {...props}>{children}</Tag>;
    }
    MarkdownHeading.displayName = `Markdown${Tag.toUpperCase()}`;
    return MarkdownHeading;
  };
  const components = {
    h2: heading("h2"),
    h3: heading("h3"),
    a: ({ href = "", children, ...props }: any) => {
      if (href.startsWith("/") || href.startsWith("#")) return <Link href={href} {...props}>{children}</Link>;
      return <a href={href} target="_blank" rel="noopener noreferrer nofollow" {...props}>{children}</a>;
    },
    img: ({ alt, src = "", ...props }: any) => {
      return allowedMediaSource(src) ? <img src={src} alt={alt || ""} loading="lazy" decoding="async" {...props} /> : null;
    },
    pre: ({ children, ...props }: any) => (
      <div className="code-block group relative my-6 overflow-hidden rounded-xl border border-border bg-zinc-950">
        <CopyCodeButton code={textOf(children).replace(/\n$/, "")} />
        <pre dir="ltr" className="overflow-x-auto p-5 text-left text-sm" {...props}>{children}</pre>
      </div>
    ),
    aside: ({ children, "data-callout": type = "note", ...props }: any) => {
      const safeType = calloutTypes.has(type) ? type as keyof typeof icons : "note";
      const Icon = icons[safeType];
      const titles = { note: "ملاحظة", tip: "نصيحة", warning: "تنبيه", danger: "تحذير" };
      return <aside data-callout={safeType} className={`callout callout-${safeType}`} {...props}><div className="callout-title"><Icon className="h-5 w-5" /><span>{titles[safeType]}</span></div><div>{children}</div></aside>;
    },
    figure: ({ children, "data-src": src, "data-alt": alt, ...props }: any) => (
      <figure className="my-8" {...props}>
        {src && allowedMediaSource(src) ? <img src={src} alt={alt || ""} loading="lazy" className="mx-auto max-h-[720px] rounded-xl object-contain" /> : null}
        {children ? <figcaption className="mt-2 text-center text-sm text-muted-foreground">{children}</figcaption> : null}
      </figure>
    ),
  };

  return (
    <article className="prose-tech">
      <MarkdownAsync
        remarkPlugins={[remarkGfm, remarkDirective, remarkSafeDirectives]}
        rehypePlugins={[
          [rehypeSanitize, sanitizeSchema],
          [rehypePrettyCode, { theme: "github-dark-dimmed", keepBackground: false }],
        ]}
        components={components}
      >
        {content}
      </MarkdownAsync>
    </article>
  );
}
