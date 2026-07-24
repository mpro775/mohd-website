import { Children, isValidElement, type ReactNode } from "react";
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
import { MermaidDiagram } from "@/features/blog/components/MermaidDiagram";
import { BlogInlineText } from "@/features/blog/components/BlogInlineText";
import { BlogKeyboardKey } from "@/features/blog/components/BlogKeyboardKey";
import { BlogTextBlock } from "@/features/blog/components/BlogTextBlock";
import { EnhancedCodeBlock } from "@/features/blog/components/EnhancedCodeBlock";
import {
  blogCodeMetaForPrettyCode,
  normalizeBlogCodeMeta,
} from "@/features/blog/markdown/blog-code-meta";
import {
  CALLOUT_TYPES,
  remarkBlogDirectives,
} from "@/features/blog/markdown/blog-directives";
import type { BlogMarkdownNode } from "@/features/blog/markdown/blog-markdown-types";

type HastNode = BlogMarkdownNode;

function allowedMediaSource(src: string): boolean {
  const configured = process.env.NEXT_PUBLIC_MEDIA_URL;
  return (
    src.startsWith("/") ||
    Boolean(configured && src.startsWith(`${configured.replace(/\/$/, "")}/`))
  );
}

function hastText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(hastText).join("");
}

/** Preserve validated fence metadata on the outer figure created by Shiki. */
export function rehypeCaptureBlogCodeMeta() {
  return (tree: HastNode) => {
    const visit = (node: HastNode) => {
      if (node.type === "element" && node.tagName === "pre") {
        const code = node.children?.[0];
        const rawMeta =
          typeof code?.data?.meta === "string" ? code.data.meta : "";
        const classNames = Array.isArray(code?.properties?.className)
          ? code.properties.className
          : [];
        const languageClass = classNames.find((value) =>
          String(value).startsWith("language-"),
        );
        const language = languageClass
          ? String(languageClass).slice("language-".length)
          : "";
        node.properties = {
          ...(node.properties ?? {}),
          dataBlogCodeMeta: normalizeBlogCodeMeta(rawMeta, language),
          dataBlogCodeLanguage: language,
        };
      }
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree);
  };
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
    "blog-text",
    "blog-inline-text",
    "blog-kbd",
  ],
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "className", "id"],
    aside: ["dataCallout"],
    figure: ["dataSrc", "dataAlt"],
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      "dataBlogCodeMeta",
      "dataBlogCodeLanguage",
    ],
    "blog-text": [
      "dataDir",
      "dataAlign",
      "dataSize",
      "data-dir",
      "data-align",
      "data-size",
    ],
    "blog-inline-text": [
      "dataMark",
      "dataSize",
      "data-mark",
      "data-size",
    ],
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
  remarkBlogDirectives,
];

export const markdownRehypePlugins: PluggableList = [
  rehypeSlug,
  rehypeCaptureBlogCodeMeta,
  rehypeMermaidCodeBlocks,
  [rehypeSanitize, sanitizeSchema],
  [
    rehypePrettyCode,
    {
      theme: "github-dark-dimmed",
      keepBackground: false,
      filterMetaString: blogCodeMetaForPrettyCode,
    },
  ],
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
  pre: ({ children, node, ...props }: any) => {
    void node;
    return (
      <pre dir="ltr" data-blog-highlighted-pre {...props}>
        {children}
      </pre>
    );
  },
  aside: ({ children, "data-callout": type = "note", ...props }: any) => {
    const safeType = CALLOUT_TYPES.has(type)
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
  figure: ({
    children,
    "data-src": src,
    "data-alt": alt,
    "data-rehype-pretty-code-figure": prettyCode,
    "data-blog-code-meta": meta = "",
    "data-blog-code-language": language = "",
    node,
    ...props
  }: any) => {
    if (prettyCode !== undefined) {
      const preNode = (node?.children ?? []).find(
        (child: HastNode) => child.tagName === "pre",
      );
      const highlightedPre = Children.toArray(children).find(
        (child) =>
          isValidElement(child) &&
          "data-blog-highlighted-pre" in (child.props as Record<string, unknown>),
      );
      return (
        <EnhancedCodeBlock
          code={preNode ? hastText(preNode).replace(/\n$/, "") : ""}
          language={String(language)}
          meta={String(meta)}
        >
          {highlightedPre ?? children}
        </EnhancedCodeBlock>
      );
    }
    return (
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
    );
  },
  "blog-text": ({
    children,
    "data-dir": dir,
    "data-align": align,
    "data-size": size,
  }: any) => (
    <BlogTextBlock dir={dir} align={align} size={size}>
      {children}
    </BlogTextBlock>
  ),
  "blog-inline-text": ({
    children,
    "data-mark": mark,
    "data-size": size,
  }: any) => (
    <BlogInlineText mark={mark} size={size}>
      {children}
    </BlogInlineText>
  ),
  "blog-kbd": ({ children }: any) => (
    <BlogKeyboardKey>{children}</BlogKeyboardKey>
  ),
  "mermaid-diagram": ({ children }: any) => (
    <MermaidDiagram chart={textOf(children)} />
  ),
} as Components;
