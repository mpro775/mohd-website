import {
  calculateContentHash,
  calculateMarkdownReadTime,
  normalizeMarkdownContent,
  validateMarkdownDraftContent,
} from './markdown-content.util';

describe('markdown-content utilities', () => {
  const technicalMarkdown = [
    '```tsx',
    '<div className="card">Hello</div>',
    '```',
    '',
    '```ts',
    'function identity<T>(value: T): T {',
    '  return value;',
    '}',
    '```',
    '',
    'x < y && y > z',
    '',
    'Array<T>',
    '',
    '<CustomComponent />',
  ].join('\r\n');

  it('normalizes newlines without corrupting JSX, HTML or generics', () => {
    const normalized = normalizeMarkdownContent(technicalMarkdown);
    expect(normalized).not.toContain('\r');
    expect(normalized).toContain('<div className="card">Hello</div>');
    expect(normalized).toContain('identity<T>');
    expect(normalized).toContain('x < y && y > z');
    expect(normalized).toContain('<CustomComponent />');
  });

  it('validates content and calculates stable values', () => {
    const normalized = normalizeMarkdownContent(technicalMarkdown);
    expect(() => validateMarkdownDraftContent(normalized)).not.toThrow();
    expect(calculateMarkdownReadTime(normalized)).toBeGreaterThanOrEqual(1);
    expect(calculateContentHash({ content: normalized })).toBe(
      calculateContentHash({ content: normalized }),
    );
  });
});
