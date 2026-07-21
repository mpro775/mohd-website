export function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function assertSlugIsNotEmpty(slug: string): string {
  const normalized = generateSlug(slug);
  if (!normalized) {
    throw new Error('Slug cannot be empty');
  }
  return normalized;
}

export function normalizeSlug(input: string): string {
  if (!input) {
    throw new Error('Input for slug cannot be empty');
  }
  return assertSlugIsNotEmpty(input);
}
