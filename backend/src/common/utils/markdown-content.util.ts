import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';

export const MAX_MARKDOWN_LENGTH = 500_000;

export function normalizeMarkdownContent(content: string): string {
  if (typeof content !== 'string') {
    throw new BadRequestException('المحتوى يجب أن يكون نص Markdown');
  }
  if (content.includes('\0')) {
    throw new BadRequestException('المحتوى يحتوي على محرف Null غير صالح');
  }
  // Lone UTF-16 surrogates cannot be encoded as valid Unicode scalar values.
  if (
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(
      content,
    )
  ) {
    throw new BadRequestException('ترميز المحتوى غير صالح');
  }
  return content.replace(/\r\n?/g, '\n');
}

export function validateMarkdownDraftContent(content: string): void {
  if (content.length > MAX_MARKDOWN_LENGTH) {
    throw new BadRequestException(
      `المحتوى يتجاوز الحد الأقصى (${MAX_MARKDOWN_LENGTH} حرف)`,
    );
  }
}

export function validateMarkdownPublishingContent(content: string): void {
  validateMarkdownDraftContent(content);

  if (!content.trim()) {
    throw new BadRequestException('محتوى المقال لا يمكن أن يكون فارغًا');
  }
}

export function calculateMarkdownReadTime(content: string): number {
  const withoutFences = content.replace(
    /(^|\n)[ \t]{0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n[ \t]*\2(?=\n|$)/g,
    ' ',
  );
  const words = withoutFences
    .replace(/[#>*_`~[\](){}|:-]/g, ' ')
    .split(/\s+/u)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(',')}}`;
}

export function calculateContentHash(payload: unknown): string {
  return createHash('sha256').update(stableSerialize(payload)).digest('hex');
}

export function extractInternalMediaUrls(content: string): string[] {
  const urls = new Set<string>();
  const markdownImage =
    /!\[[^\]]*]\((?:<)?([^)>\s]+)(?:>)?(?:\s+["'][^"']*["'])?\)/g;
  const figureDirective =
    /:::figure\{[^}]*\bsrc=(?:"([^"]+)"|'([^']+)'|([^\s}]+))/g;
  for (const match of content.matchAll(markdownImage)) urls.add(match[1]);
  for (const match of content.matchAll(figureDirective)) {
    urls.add(match[1] || match[2] || match[3]);
  }
  return [...urls].filter(Boolean);
}
