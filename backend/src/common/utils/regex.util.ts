export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildSafeRegex(value?: string): RegExp | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  return new RegExp(escapeRegExp(normalized), 'i');
}
