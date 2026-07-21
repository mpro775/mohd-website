import * as fs from 'fs';
import * as path from 'path';
import mongoose, { Types } from 'mongoose';
import { CertificationType } from '../../../common/taxonomy/credential-taxonomy';
import { normalizeSlug } from '../../../common/utils/slug.util';

type LegacyCertificate = {
  title?: unknown;
  issuer?: unknown;
  date?: unknown;
  url?: unknown;
};

type LegacyProfile = {
  _id: Types.ObjectId;
  certificates?: LegacyCertificate[];
};

type MigrationMapping = {
  profileId: string;
  legacyIndex: number;
  certificationId?: string;
  slug: string;
  fingerprint: string;
  createdInThisRun: boolean;
};

export type MigrationReport = {
  mode: 'dry-run' | 'apply';
  startedAt: string;
  completedAt?: string;
  profilesFound: number;
  legacyCertificatesFound: number;
  created: number;
  alreadyMigrated: number;
  skipped: number;
  legacyRemovedFromProfiles: number;
  requiresManualReview: Array<{
    profileId: string;
    legacyIndex: number;
    title: string;
    reason: string;
  }>;
  invalidDates: Array<{
    profileId: string;
    legacyIndex: number;
    value: unknown;
  }>;
  invalidUrls: Array<{
    profileId: string;
    legacyIndex: number;
    value: unknown;
  }>;
  duplicates: Array<{
    profileId: string;
    legacyIndex: number;
    certificationId: string;
  }>;
  mapping: MigrationMapping[];
  errors: string[];
};

type MigrationFlags = {
  apply: boolean;
  removeLegacy: boolean;
  allowMissingIssuer: boolean;
};

const REPORT_PATH = path.resolve(
  __dirname,
  '../../../../certifications-migration-report.json',
);

function loadLocalEnv(): void {
  const envPath = path.resolve(__dirname, '../../../../.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const separator = line.indexOf('=');
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = line
      .slice(separator + 1)
      .trim()
      .replace(/(^["']|["']$)/g, '');
  }
}

export function parseMigrationFlags(args: string[]): MigrationFlags {
  const apply = args.includes('--apply');
  const dryRun = args.includes('--dry-run');
  if (apply && dryRun) {
    throw new Error('استخدم --dry-run أو --apply، وليس كليهما');
  }
  const removeLegacy = args.includes('--remove-legacy');
  if (removeLegacy && !apply) {
    throw new Error('--remove-legacy يتطلب --apply');
  }
  return {
    apply,
    removeLegacy,
    allowMissingIssuer: args.includes('--allow-missing-issuer'),
  };
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function parseLegacyDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (
    !(value instanceof Date) &&
    typeof value !== 'string' &&
    typeof value !== 'number'
  ) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function parseLegacyHttpUrl(value: unknown): string | undefined {
  const candidate = text(value);
  if (!candidate) return undefined;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

export function inferKnownPlatform(url?: string): string | undefined {
  if (!url) return undefined;
  const hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  if (hostname === 'coursera.org' || hostname.endsWith('.coursera.org')) {
    return 'Coursera';
  }
  if (hostname === 'udemy.com' || hostname.endsWith('.udemy.com')) {
    return 'Udemy';
  }
  if (hostname === 'edx.org' || hostname.endsWith('.edx.org')) return 'edX';
  if (
    (hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com')) &&
    new URL(url).pathname.startsWith('/learning')
  ) {
    return 'LinkedIn Learning';
  }
  return undefined;
}

function fingerprint(values: {
  title: string;
  issuer: string;
  issuedAt?: Date;
  credentialUrl?: string;
}): string {
  return [
    values.title.toLocaleLowerCase(),
    values.issuer.toLocaleLowerCase(),
    values.issuedAt?.toISOString() ?? '',
    values.credentialUrl ?? '',
  ].join('|');
}

async function uniqueSlug(
  baseTitle: string,
  issuer: string,
  hasSlug: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = normalizeSlug(baseTitle);
  if (!(await hasSlug(base))) return base;
  const withIssuer = normalizeSlug(`${baseTitle}-${issuer}`);
  if (!(await hasSlug(withIssuer))) return withIssuer;
  let suffix = 2;
  while (await hasSlug(`${withIssuer}-${suffix}`)) suffix += 1;
  return `${withIssuer}-${suffix}`;
}

function writeReport(report: MigrationReport): void {
  report.completedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
}

export async function runProfileCertificatesMigration(
  flags: MigrationFlags,
): Promise<MigrationReport> {
  loadLocalEnv();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI غير مضبوط');

  const report: MigrationReport = {
    mode: flags.apply ? 'apply' : 'dry-run',
    startedAt: new Date().toISOString(),
    profilesFound: 0,
    legacyCertificatesFound: 0,
    created: 0,
    alreadyMigrated: 0,
    skipped: 0,
    legacyRemovedFromProfiles: 0,
    requiresManualReview: [],
    invalidDates: [],
    invalidUrls: [],
    duplicates: [],
    mapping: [],
    errors: [],
  };

  await mongoose.connect(uri);
  try {
    const db = mongoose.connection.db;
    if (!db) throw new Error('تعذر الوصول إلى اتصال MongoDB');
    const profiles = db.collection<LegacyProfile>('profiles');
    const certifications = db.collection('certifications');
    const profileList = await profiles
      .find({ 'certificates.0': { $exists: true } })
      .toArray();
    report.profilesFound = profileList.length;
    const reservedSlugs = new Set<string>();

    for (const profile of profileList) {
      const legacyList = Array.isArray(profile.certificates)
        ? profile.certificates
        : [];
      report.legacyCertificatesFound += legacyList.length;

      for (const [legacyIndex, legacy] of legacyList.entries()) {
        const title = text(legacy.title);
        if (!title) {
          report.skipped += 1;
          report.requiresManualReview.push({
            profileId: profile._id.toString(),
            legacyIndex,
            title: '',
            reason: 'العنوان مفقود',
          });
          continue;
        }

        const legacyIssuer = text(legacy.issuer);
        if (!legacyIssuer) {
          report.requiresManualReview.push({
            profileId: profile._id.toString(),
            legacyIndex,
            title,
            reason: flags.allowMissingIssuer
              ? 'الجهة المانحة مفقودة؛ تم قبول القيمة «غير محدد» صراحة'
              : 'الجهة المانحة مفقودة؛ استخدم --allow-missing-issuer بعد المراجعة',
          });
          if (!flags.allowMissingIssuer) {
            report.skipped += 1;
            continue;
          }
        }
        const issuer = legacyIssuer ?? 'غير محدد';

        const issuedAt = parseLegacyDate(legacy.date);
        if (legacy.date && !issuedAt) {
          report.invalidDates.push({
            profileId: profile._id.toString(),
            legacyIndex,
            value: legacy.date,
          });
        }
        const credentialUrl = parseLegacyHttpUrl(legacy.url);
        if (legacy.url && !credentialUrl) {
          report.invalidUrls.push({
            profileId: profile._id.toString(),
            legacyIndex,
            value: legacy.url,
          });
        }

        const identity = { title, issuer, issuedAt, credentialUrl };
        const exactFilter: Record<string, unknown> = { title, issuer };
        exactFilter.issuedAt = issuedAt ?? { $exists: false };
        exactFilter.credentialUrl = credentialUrl ?? { $exists: false };
        const existing = await certifications.findOne(exactFilter);
        if (existing) {
          report.alreadyMigrated += 1;
          report.duplicates.push({
            profileId: profile._id.toString(),
            legacyIndex,
            certificationId: existing._id.toString(),
          });
          report.mapping.push({
            profileId: profile._id.toString(),
            legacyIndex,
            certificationId: existing._id.toString(),
            slug: String(existing.slug ?? ''),
            fingerprint: fingerprint(identity),
            createdInThisRun: false,
          });
          continue;
        }

        const slug = await uniqueSlug(title, issuer, async (candidate) => {
          if (reservedSlugs.has(candidate)) return true;
          return Boolean(await certifications.findOne({ slug: candidate }));
        });
        reservedSlugs.add(slug);
        const now = new Date();
        const document = {
          title,
          slug,
          type: CertificationType.COURSE,
          issuer,
          ...(credentialUrl ? { credentialUrl } : {}),
          ...(issuedAt ? { issuedAt } : {}),
          ...(inferKnownPlatform(credentialUrl)
            ? { platform: inferKnownPlatform(credentialUrl) }
            : {}),
          doesNotExpire: true,
          skills: [],
          isFeatured: false,
          isPublished: true,
          order: legacyIndex,
          seo: {},
          createdAt: now,
          updatedAt: now,
        };

        let certificationId: string | undefined;
        if (flags.apply) {
          const result = await certifications.insertOne(document);
          certificationId = result.insertedId.toString();
          report.created += 1;
        }
        report.mapping.push({
          profileId: profile._id.toString(),
          legacyIndex,
          certificationId,
          slug,
          fingerprint: fingerprint(identity),
          createdInThisRun: flags.apply,
        });
      }
    }

    const fullyAccountedFor =
      report.created + report.alreadyMigrated ===
      report.legacyCertificatesFound;
    if (flags.removeLegacy) {
      if (
        (report.requiresManualReview.length && !flags.allowMissingIssuer) ||
        !fullyAccountedFor
      ) {
        throw new Error(
          'رفض إزالة البيانات القديمة: توجد عناصر تحتاج مراجعة أو لم تتم مطابقة جميع العناصر',
        );
      }
      const result = await profiles.updateMany(
        { 'certificates.0': { $exists: true } },
        { $unset: { certificates: '' } },
      );
      report.legacyRemovedFromProfiles = result.modifiedCount;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    report.errors.push(message);
    throw error;
  } finally {
    writeReport(report);
    await mongoose.disconnect();
  }
  return report;
}

async function main() {
  const flags = parseMigrationFlags(process.argv.slice(2));
  const report = await runProfileCertificatesMigration(flags);
  console.log(
    JSON.stringify(
      {
        mode: report.mode,
        found: report.legacyCertificatesFound,
        created: report.created,
        alreadyMigrated: report.alreadyMigrated,
        skipped: report.skipped,
        requiresManualReview: report.requiresManualReview.length,
        report: REPORT_PATH,
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
