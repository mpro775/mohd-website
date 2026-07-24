export const BLOG_TEXT_DIRECTIONS = ["auto", "rtl", "ltr"] as const;
export const BLOG_TEXT_ALIGNMENTS = [
  "start",
  "center",
  "end",
  "justify",
] as const;
export const BLOG_TEXT_SIZES = ["sm", "base", "lg", "xl", "lead"] as const;
export const BLOG_INLINE_TEXT_SIZES = ["sm", "base", "lg", "xl"] as const;
export const BLOG_CODE_MAX_HEIGHTS = [
  "auto",
  "240",
  "320",
  "420",
  "560",
  "720",
] as const;

export type BlogTextDirection = (typeof BLOG_TEXT_DIRECTIONS)[number];
export type BlogTextAlign = (typeof BLOG_TEXT_ALIGNMENTS)[number];
export type BlogTextSize = (typeof BLOG_TEXT_SIZES)[number];
export type BlogInlineTextSize = (typeof BLOG_INLINE_TEXT_SIZES)[number];
export type BlogCodeMaxHeight = (typeof BLOG_CODE_MAX_HEIGHTS)[number];

export type BlogTextBlockOptions = {
  dir: BlogTextDirection;
  align: BlogTextAlign;
  size: BlogTextSize;
};

export type BlogInlineTextOptions = {
  mark: boolean;
  size: BlogInlineTextSize;
};

export type BlogCodeBlockOptions = {
  language: string;
  title?: string;
  maxHeight: BlogCodeMaxHeight;
  wrap: boolean;
  lineNumbers: boolean;
  collapsible: boolean;
  collapsed: boolean;
  highlight?: string;
};

export const DEFAULT_BLOG_TEXT_BLOCK_OPTIONS: BlogTextBlockOptions = {
  dir: "auto",
  align: "start",
  size: "base",
};

export const DEFAULT_BLOG_INLINE_TEXT_OPTIONS: BlogInlineTextOptions = {
  mark: false,
  size: "base",
};

export const DEFAULT_BLOG_CODE_BLOCK_OPTIONS: BlogCodeBlockOptions = {
  language: "ts",
  maxHeight: "auto",
  wrap: false,
  lineNumbers: false,
  collapsible: false,
  collapsed: false,
};

export const BLOG_FORMAT_LABELS = {
  directions: {
    auto: "تلقائي",
    rtl: "RTL",
    ltr: "LTR",
  },
  alignments: {
    start: "بداية السطر",
    center: "الوسط",
    end: "نهاية السطر",
    justify: "ضبط كامل",
  },
  sizes: {
    sm: "صغير",
    base: "عادي",
    lg: "كبير",
    xl: "بارز",
    lead: "مقدمة",
  },
  codeHeights: {
    auto: "تلقائي",
    "240": "240px",
    "320": "320px",
    "420": "420px",
    "560": "560px",
    "720": "720px",
  },
} as const;

function isOneOf<T extends readonly string[]>(
  values: T,
  value: unknown,
): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

export const isBlogTextDirection = (value: unknown): value is BlogTextDirection =>
  isOneOf(BLOG_TEXT_DIRECTIONS, value);

export const isBlogTextAlign = (value: unknown): value is BlogTextAlign =>
  isOneOf(BLOG_TEXT_ALIGNMENTS, value);

export const isBlogTextSize = (value: unknown): value is BlogTextSize =>
  isOneOf(BLOG_TEXT_SIZES, value);

export const isBlogInlineTextSize = (
  value: unknown,
): value is BlogInlineTextSize => isOneOf(BLOG_INLINE_TEXT_SIZES, value);

export const isBlogCodeMaxHeight = (
  value: unknown,
): value is BlogCodeMaxHeight => isOneOf(BLOG_CODE_MAX_HEIGHTS, value);

export function parseBlogTextBlockOptions(
  attributes?: Record<string, unknown> | null,
): BlogTextBlockOptions {
  return {
    dir: isBlogTextDirection(attributes?.dir)
      ? attributes.dir
      : DEFAULT_BLOG_TEXT_BLOCK_OPTIONS.dir,
    align: isBlogTextAlign(attributes?.align)
      ? attributes.align
      : DEFAULT_BLOG_TEXT_BLOCK_OPTIONS.align,
    size: isBlogTextSize(attributes?.size)
      ? attributes.size
      : DEFAULT_BLOG_TEXT_BLOCK_OPTIONS.size,
  };
}

export function serializeBlogTextBlockAttributes(
  options: BlogTextBlockOptions,
): Record<string, string> {
  const attributes: Record<string, string> = {};
  if (options.dir !== DEFAULT_BLOG_TEXT_BLOCK_OPTIONS.dir)
    attributes.dir = options.dir;
  if (options.align !== DEFAULT_BLOG_TEXT_BLOCK_OPTIONS.align)
    attributes.align = options.align;
  if (options.size !== DEFAULT_BLOG_TEXT_BLOCK_OPTIONS.size)
    attributes.size = options.size;
  return attributes;
}

export function parseBlogInlineTextOptions(
  attributes?: Record<string, unknown> | null,
): BlogInlineTextOptions {
  return {
    mark: attributes?.mark === "true" || attributes?.mark === true,
    size: isBlogInlineTextSize(attributes?.size)
      ? attributes.size
      : DEFAULT_BLOG_INLINE_TEXT_OPTIONS.size,
  };
}

export function serializeBlogInlineTextAttributes(
  options: BlogInlineTextOptions,
): Record<string, string> {
  const attributes: Record<string, string> = {};
  if (options.mark) attributes.mark = "true";
  if (options.size !== DEFAULT_BLOG_INLINE_TEXT_OPTIONS.size)
    attributes.size = options.size;
  return attributes;
}

