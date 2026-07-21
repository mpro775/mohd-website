import {
  inferKnownPlatform,
  parseLegacyDate,
  parseLegacyHttpUrl,
  parseMigrationFlags,
} from './migrate-profile-certificates';
import { rollbackProfileCertificates } from './rollback-profile-certificates';

describe('profile certificates migration helpers', () => {
  it('defaults to dry-run and requires apply for legacy removal', () => {
    expect(parseMigrationFlags([])).toEqual({
      apply: false,
      removeLegacy: false,
      allowMissingIssuer: false,
    });
    expect(() => parseMigrationFlags(['--remove-legacy'])).toThrow();
    expect(() => parseMigrationFlags(['--apply', '--dry-run'])).toThrow();
  });

  it('parses valid dates and rejects invalid dates', () => {
    expect(parseLegacyDate('2026-05-15')?.toISOString()).toContain(
      '2026-05-15',
    );
    expect(parseLegacyDate('not-a-date')).toBeUndefined();
  });

  it('accepts only HTTP URLs', () => {
    expect(parseLegacyHttpUrl('https://coursera.org/certificate/1')).toContain(
      'https://coursera.org',
    );
    expect(parseLegacyHttpUrl('javascript:alert(1)')).toBeUndefined();
  });

  it.each([
    ['https://coursera.org/x', 'Coursera'],
    ['https://www.udemy.com/x', 'Udemy'],
    ['https://edx.org/x', 'edX'],
    ['https://linkedin.com/learning/course', 'LinkedIn Learning'],
    ['https://example.com/x', undefined],
  ])('infers only known platforms from %s', (url, expected) => {
    expect(inferKnownPlatform(url)).toBe(expected);
  });

  it('requires an explicit apply flag before rollback can touch data', async () => {
    await expect(rollbackProfileCertificates(false)).rejects.toThrow(
      'Rollback يتطلب --apply صراحة',
    );
  });
});
