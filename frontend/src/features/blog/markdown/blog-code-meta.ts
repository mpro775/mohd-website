import {
  BLOG_CODE_MAX_HEIGHTS,
  DEFAULT_BLOG_CODE_BLOCK_OPTIONS,
  type BlogCodeBlockOptions,
  type BlogCodeMaxHeight,
  isBlogCodeMaxHeight,
} from "./blog-format-contract";

const META_KEYS = [
  "title",
  "maxHeight",
  "wrap",
  "lineNumbers",
  "collapsible",
  "collapsed",
  "highlight",
] as const;

const META_KEY_SET = new Set<string>(META_KEYS);
const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/u;
const HIGHLIGHT_PATTERN = /^[1-9]\d*(?:-[1-9]\d*)?(?:,[1-9]\d*(?:-[1-9]\d*)?)*$/;

export type BlogCodeMetaParseResult = {
  options: BlogCodeBlockOptions;
  warnings: string[];
};

type MetaToken = { key: string; value: string };

function tokenizeMeta(meta: string): {
  tokens: MetaToken[];
  warnings: string[];
} {
  const tokens: MetaToken[] = [];
  const warnings: string[] = [];
  let index = 0;

  while (index < meta.length) {
    while (/\s/u.test(meta[index] ?? "")) index += 1;
    if (index >= meta.length) break;

    const keyStart = index;
    while (/[A-Za-z]/u.test(meta[index] ?? "")) index += 1;
    const key = meta.slice(keyStart, index);
    if (!key || meta[index] !== "=") {
      warnings.push("تم تجاهل جزء Metadata غير صالح.");
      while (index < meta.length && !/\s/u.test(meta[index])) index += 1;
      continue;
    }
    index += 1;

    let value = "";
    const quote = meta[index] === '"' || meta[index] === "'" ? meta[index] : "";
    if (quote) {
      index += 1;
      let closed = false;
      while (index < meta.length) {
        const character = meta[index];
        if (character === "\\" && index + 1 < meta.length) {
          value += meta[index + 1];
          index += 2;
          continue;
        }
        if (character === quote) {
          index += 1;
          closed = true;
          break;
        }
        value += character;
        index += 1;
      }
      if (!closed) warnings.push(`علامة الاقتباس للحقل ${key} غير مغلقة.`);
    } else {
      const valueStart = index;
      while (index < meta.length && !/\s/u.test(meta[index])) index += 1;
      value = meta.slice(valueStart, index);
    }
    tokens.push({ key, value });
  }

  return { tokens, warnings };
}

function parseBoolean(value: string): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export function isValidBlogHighlight(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 500) return false;
  if (!HIGHLIGHT_PATTERN.test(value)) return false;
  const parts = value.split(",");
  if (parts.length > 50) return false;
  return parts.every((part) => {
    const [startText, endText = startText] = part.split("-");
    const start = Number(startText);
    const end = Number(endText);
    return (
      Number.isSafeInteger(start) &&
      Number.isSafeInteger(end) &&
      start >= 1 &&
      end >= start &&
      end <= 10_000
    );
  });
}

export function parseBlogHighlightLines(
  value: unknown,
  lineCount = 10_000,
): Set<number> {
  const lines = new Set<number>();
  if (!isValidBlogHighlight(value)) return lines;
  const safeLineCount = Math.max(0, Math.min(10_000, lineCount));
  for (const part of value.split(",")) {
    const [startText, endText = startText] = part.split("-");
    const start = Number(startText);
    const end = Math.min(Number(endText), safeLineCount);
    for (let line = start; line <= end; line += 1) lines.add(line);
  }
  return lines;
}

export function parseBlogCodeMeta(
  meta = "",
  language = DEFAULT_BLOG_CODE_BLOCK_OPTIONS.language,
): BlogCodeMetaParseResult {
  const { tokens, warnings } = tokenizeMeta(meta);
  const seen = new Set<string>();
  const options: BlogCodeBlockOptions = {
    ...DEFAULT_BLOG_CODE_BLOCK_OPTIONS,
    language: language || DEFAULT_BLOG_CODE_BLOCK_OPTIONS.language,
  };

  for (const { key, value } of tokens) {
    if (!META_KEY_SET.has(key)) {
      warnings.push(`تم تجاهل الخاصية غير المعروفة: ${key}.`);
      continue;
    }
    if (seen.has(key)) {
      warnings.push(`تم تجاهل التكرار في الخاصية: ${key}.`);
      continue;
    }
    seen.add(key);

    if (key === "title") {
      if (!value || value.length > 100 || CONTROL_CHARACTERS.test(value))
        warnings.push("تم تجاهل عنوان كود غير صالح.");
      else options.title = value;
      continue;
    }
    if (key === "maxHeight") {
      if (isBlogCodeMaxHeight(value)) options.maxHeight = value;
      else warnings.push("تم تجاهل قيمة ارتفاع غير مدعومة.");
      continue;
    }
    if (key === "highlight") {
      if (isValidBlogHighlight(value)) options.highlight = value;
      else warnings.push("صيغة الأسطر المميزة غير صحيحة.");
      continue;
    }

    const booleanValue = parseBoolean(value);
    if (booleanValue === null) {
      warnings.push(`تم تجاهل قيمة منطقية غير صالحة: ${key}.`);
      continue;
    }
    options[key as "wrap" | "lineNumbers" | "collapsible" | "collapsed"] =
      booleanValue;
  }

  if (!options.collapsible) options.collapsed = false;
  return { options, warnings };
}

function quoteMetaValue(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

export function serializeBlogCodeMeta(
  input: Partial<BlogCodeBlockOptions>,
): string {
  const options: BlogCodeBlockOptions = {
    ...DEFAULT_BLOG_CODE_BLOCK_OPTIONS,
    ...input,
  };
  const parts: string[] = [];
  if (
    options.title &&
    options.title.length <= 100 &&
    !CONTROL_CHARACTERS.test(options.title)
  )
    parts.push(`title=${quoteMetaValue(options.title)}`);
  if (
    isBlogCodeMaxHeight(options.maxHeight) &&
    options.maxHeight !== DEFAULT_BLOG_CODE_BLOCK_OPTIONS.maxHeight
  )
    parts.push(`maxHeight=${quoteMetaValue(options.maxHeight)}`);
  if (options.wrap) parts.push('wrap="true"');
  if (options.lineNumbers) parts.push('lineNumbers="true"');
  if (options.collapsible) parts.push('collapsible="true"');
  if (options.collapsible && options.collapsed) parts.push('collapsed="true"');
  if (isValidBlogHighlight(options.highlight))
    parts.push(`highlight=${quoteMetaValue(options.highlight)}`);
  return parts.join(" ");
}

export function normalizeBlogCodeMeta(
  meta = "",
  language = DEFAULT_BLOG_CODE_BLOCK_OPTIONS.language,
): string {
  return serializeBlogCodeMeta(parseBlogCodeMeta(meta, language).options);
}

export function blogCodeMetaForPrettyCode(meta = ""): string {
  const { options } = parseBlogCodeMeta(meta);
  const parts: string[] = [];
  if (options.highlight) parts.push(`{${options.highlight}}`);
  if (options.lineNumbers) parts.push("showLineNumbers");
  return parts.join(" ");
}

export function blogCodeMaxHeightClass(
  value: BlogCodeMaxHeight,
): string {
  return value === "auto" ? "blog-code-height-auto" : `blog-code-height-${value}`;
}

export { BLOG_CODE_MAX_HEIGHTS };

