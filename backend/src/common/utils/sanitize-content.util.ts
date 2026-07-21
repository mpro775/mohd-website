import sanitizeHtml from 'sanitize-html';

export function sanitizePlainText(value?: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}
