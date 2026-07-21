import { parseBlogMigrationMode } from './migrate-blog-v2';

describe('blog v2 migration flags', () => {
  it('defaults to dry-run and keeps modes exclusive', () => {
    expect(parseBlogMigrationMode([])).toBe('dry-run');
    expect(parseBlogMigrationMode(['--apply'])).toBe('apply');
    expect(parseBlogMigrationMode(['--verify'])).toBe('verify');
    expect(() => parseBlogMigrationMode(['--apply', '--verify'])).toThrow();
  });
});
