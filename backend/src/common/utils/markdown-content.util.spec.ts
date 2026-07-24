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

  it('preserves advanced Markdown directives and code metadata', () => {
    const advancedMarkdown = [
      ':::text{dir="rtl" align="justify" size="lead"}',
      'فقرة عربية :text[مهمة]{mark="true" size="lg"} مع :kbd[Ctrl + K].',
      ':::',
      '',
      '```tsx title="User Card.tsx" maxHeight="320" wrap="true" lineNumbers="true" highlight="2,4-6"',
      'export const UserCard = () => <article>User</article>;',
      '```',
    ].join('\r\n');

    const normalized = normalizeMarkdownContent(advancedMarkdown);
    expect(normalized).toContain(
      ':::text{dir="rtl" align="justify" size="lead"}',
    );
    expect(normalized).toContain(':text[مهمة]{mark="true" size="lg"}');
    expect(normalized).toContain(':kbd[Ctrl + K]');
    expect(normalized).toContain(
      'title="User Card.tsx" maxHeight="320" wrap="true" lineNumbers="true" highlight="2,4-6"',
    );
    expect(normalized).not.toContain('\r');
  });
});
