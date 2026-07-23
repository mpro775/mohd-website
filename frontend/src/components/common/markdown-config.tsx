import type { ReactNode } from "react";
import Link from "next/link";
import type { Components } from "react-markdown";
import { defaultSchema } from "hast-util-sanitize";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import type { PluggableList } from "unified";
import { AlertCircle, Info, Lightbulb, TriangleAlert } from "lucide-react";
import { CopyCodeButton } from "@/features/blog/components/CodeBlock";
import { MermaidDiagram } from "@/features/blog/components/MermaidDiagram";

type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const calloutTypes = new Set(["note", "tip", "warning", "danger"]);

function allowedMediaSource(src: string): boolean {
  const configured = process.env.NEXT_PUBLIC_MEDIA_URL;
  return (
    src.startsWith("/") ||
    Boolean(configured && src.startsWith(`${configured.replace(/\/$/, "")}/`))
  );
}

function remarkSafeDirectives() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (node?.type === "containerDirective") {
        const directive = node as HastNode & {
          name?: string;
          attributes?: Record<string, unknown>;
          data?: Record<string, unknown>;
        };
        if (directive.name && calloutTypes.has(directive.name)) {
          directive.data = {
            ...(directive.data ?? {}),
            hName: "aside",
            hProperties: { "data-callout": directive.name },
          };
        } else if (directive.name === "figure") {
          const { src, alt } = directive.attributes ?? {};
          if (
            typeof src === "string" &&
            typeof alt === "string" &&
            alt.trim()
          ) {
            directive.data = {
              ...(directive.data ?? {}),
              hName: "figure",
              hProperties: { "data-src": src, "data-alt": alt },
            };
          } else {
            directive.type = "paragraph";
          }
        } else {
          directive.type = "paragraph";
          delete directive.data;
        }
      }
      for (const child of node?.children ?? []) visit(child);
    };
    visit(tree);
  };
}

function hastText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

/** Extract Mermaid fences before Shiki sees them. */
export function rehypeMermaidCodeBlocks() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (!node.children) return;

      node.children = node.children.map((child) => {
        if (child.type === "element" && child.tagName === "pre") {
          const code = child.children?.[0];
          const classNames = Array.isArray(code?.properties?.className)
            ? code.properties.className
            : [];
          const isMermaid =
            code?.tagName === "code" &&
            classNames.some(
              (name) => String(name).toLowerCase() === "language-mermaid",
            );

          if (isMermaid && code) {
            return {
              type: "element",
              tagName: "mermaid-diagram",
              properties: {},
              children: [
                { type: "text", value: hastText(code).replace(/\n$/, "") },
              ],
            };
          }
        }

        visit(child);
        return child;
      });
    };

    visit(tree);
  };
}

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "aside",
    "figure",
    "figcaption",
    "mermaid-diagram",
  ],
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
  if (node && typeof node === "object" && "props" in node)
    return textOf((node as { props: { children?: ReactNode } }).props.children);
  return "";
}

const icons = {
  note: Info,
  tip: Lightbulb,
  warning: TriangleAlert,
  danger: AlertCircle,
};

export const markdownRemarkPlugins: PluggableList = [
  remarkGfm,
  remarkDirective,
  remarkSafeDirectives,
];

export const markdownRehypePlugins: PluggableList = [
  rehypeSlug,
  rehypeMermaidCodeBlocks,
  [rehypeSanitize, sanitizeSchema],
  [rehypePrettyCode, { theme: "github-dark-dimmed", keepBackground: false }],
];

export const markdownComponents = {
  h2: ({ children, ...props }: any) => (
    <h2 className="scroll-mt-28" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: any) => (
    <h3 className="scroll-mt-28" {...props}>
      {children}
    </h3>
  ),
  a: ({ href = "", children, ...props }: any) => {
    if (href.startsWith("/") || href.startsWith("#"))
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        {...props}
      >
        {children}
      </a>
    );
  },
  img: ({ alt, src = "", ...props }: any) =>
    allowedMediaSource(src) ? (
      <img
        src={src}
        alt={alt || ""}
        loading="lazy"
        decoding="async"
        {...props}
      />
    ) : null,
  pre: ({ children, ...props }: any) => (
    <div className="code-block group relative my-6 overflow-hidden rounded-xl border border-border bg-zinc-950">
      <CopyCodeButton code={textOf(children).replace(/\n$/, "")} />
      <pre
        dir="ltr"
        className="overflow-x-auto p-5 text-left text-sm"
        {...props}
      >
        {children}
      </pre>
    </div>
  ),
  aside: ({ children, "data-callout": type = "note", ...props }: any) => {
    const safeType = calloutTypes.has(type)
      ? (type as keyof typeof icons)
      : "note";
    const Icon = icons[safeType];
    const titles = {
      note: "ملاحظة",
      tip: "نصيحة",
      warning: "تنبيه",
      danger: "تحذير",
    };
    return (
      <aside
        data-callout={safeType}
        className={`callout callout-${safeType}`}
        {...props}
      >
        <div className="callout-title">
          <Icon className="h-5 w-5" />
          <span>{titles[safeType]}</span>
        </div>
        <div>{children}</div>
      </aside>
    );
  },
  figure: ({ children, "data-src": src, "data-alt": alt, ...props }: any) => (
    <figure className="my-8" {...props}>
      {src && allowedMediaSource(src) ? (
        <img
          src={src}
          alt={alt || ""}
          loading="lazy"
          className="mx-auto max-h-[720px] rounded-xl object-contain"
        />
      ) : null}
      {children ? (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {children}
        </figcaption>
      ) : null}
    </figure>
  ),
  "mermaid-diagram": ({ children }: any) => (
    <MermaidDiagram chart={textOf(children)} />
  ),
} as Components;
