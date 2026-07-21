import * as fs from 'fs';
import * as path from 'path';
import mongoose, { Types } from 'mongoose';
import {
  calculateContentHash,
  calculateMarkdownReadTime,
  extractInternalMediaUrls,
  normalizeMarkdownContent,
} from '../../../common/utils/markdown-content.util';

type Mode = 'dry-run' | 'apply' | 'verify';
type Warning = { postId?: string; code: string; message: string };

export type BlogMigrationReport = {
  mode: Mode;
  startedAt: string;
  completedAt?: string;
  before: {
    posts: number;
    categories: number;
    tags: number;
    statuses: Record<string, number>;
  };
  postsScanned: number;
  postsChanged: number;
  baselineRevisionsCreated: number;
  technicalContentReview: Array<{ id: string; slug?: string; title?: string }>;
  warnings: Warning[];
  verification: Record<string, number | boolean>;
};

const REPORT_PATH = path.resolve(
  __dirname,
  '../../../../blog-v2-migration-report.json',
);

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../../../.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const index = line.indexOf('=');
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    if (!key || process.env[key] !== undefined) continue;
    process.env[key] = line
      .slice(index + 1)
      .trim()
      .replace(/(^["']|["']$)/g, '');
  }
}

export function parseBlogMigrationMode(args: string[]): Mode {
  const modes = [
    args.includes('--dry-run'),
    args.includes('--apply'),
    args.includes('--verify'),
  ].filter(Boolean).length;
  if (modes > 1)
    throw new Error(
      'استخدم وضعًا واحدًا فقط: --dry-run أو --apply أو --verify',
    );
  if (args.includes('--apply')) return 'apply';
  if (args.includes('--verify')) return 'verify';
  return 'dry-run';
}

export async function runBlogV2Migration(
  mode: Mode,
): Promise<BlogMigrationReport> {
  loadEnv();
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI غير مضبوط');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('تعذر الاتصال بقاعدة البيانات');
  const posts = db.collection('posts');
  const revisions = db.collection('postrevisions');
  const categories = db.collection('categories');
  const tags = db.collection('tags');
  const media = db.collection('media');
  const statusRows = await posts
    .aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    .toArray();
  const report: BlogMigrationReport = {
    mode,
    startedAt: new Date().toISOString(),
    before: {
      posts: await posts.countDocuments(),
      categories: await categories.countDocuments(),
      tags: await tags.countDocuments(),
      statuses: Object.fromEntries(
        statusRows.map((item) => [String(item._id), item.count]),
      ),
    },
    postsScanned: 0,
    postsChanged: 0,
    baselineRevisionsCreated: 0,
    technicalContentReview: [],
    warnings: [],
    verification: {},
  };

  try {
    if (mode !== 'verify') {
      for await (const post of posts.find({})) {
        report.postsScanned += 1;
        const content = normalizeMarkdownContent(String(post.content ?? ''));
        const urls = extractInternalMediaUrls(content);
        const mediaRows = urls.length
          ? await media
              .find({ url: { $in: urls } })
              .project({ _id: 1 })
              .toArray()
          : [];
        const now = new Date();
        const update: Record<string, unknown> = {
          content,
          contentFormat: 'markdown',
          contentVersion: Number(post.contentVersion ?? 1),
          version: Number(post.version ?? 1),
          previousSlugs: Array.isArray(post.previousSlugs)
            ? post.previousSlugs
            : [],
          contentMediaIds: mediaRows.map((item) => item._id),
          viewCount: Number(post.viewCount ?? post.views ?? 0),
          uniqueViewCount: Number(post.uniqueViewCount ?? 0),
          readTime: calculateMarkdownReadTime(content),
          relatedPostIds: Array.isArray(post.relatedPostIds)
            ? post.relatedPostIds
            : [],
          allowIndexing: post.allowIndexing !== false,
          isFeatured: Boolean(post.isFeatured),
        };
        const editable = {
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          excerpt: post.excerpt,
          content,
          featuredImageMediaId: post.featuredImageMediaId,
          coverImageMediaId: post.coverImageMediaId,
          category: post.category,
          tags: post.tags ?? [],
          relatedPostIds: update.relatedPostIds,
          isFeatured: update.isFeatured,
          featuredOrder: post.featuredOrder,
          allowIndexing: update.allowIndexing,
          canonicalUrl: post.canonicalUrl,
          seo: post.seo ?? {},
        };
        update.contentHash = calculateContentHash(editable);

        const legacyDate =
          post.publishDate instanceof Date ? post.publishDate : undefined;
        if (post.status === 'published') {
          const publishedAt =
            post.publishedAt ?? legacyDate ?? post.createdAt ?? now;
          update.publishedAt = publishedAt;
          update.firstPublishedAt = post.firstPublishedAt ?? publishedAt;
          update.lastPublishedAt = post.lastPublishedAt ?? publishedAt;
        } else if (post.status === 'scheduled') {
          const scheduledAt =
            post.scheduledAt instanceof Date && post.scheduledAt > now
              ? post.scheduledAt
              : legacyDate && legacyDate > now
                ? legacyDate
                : undefined;
          if (scheduledAt) update.scheduledAt = scheduledAt;
          else {
            update.status = 'draft';
            report.warnings.push({
              postId: post._id.toString(),
              code: 'INVALID_SCHEDULE',
              message: 'تم تحويل المقال المجدول بلا موعد صالح إلى مسودة',
            });
          }
        } else if (
          (post.status === 'draft' || post.status === 'archived') &&
          post.lastPublishedAt
        ) {
          update.firstPublishedAt =
            post.firstPublishedAt ?? post.lastPublishedAt;
          update.lastPublishedAt = post.lastPublishedAt;
        }

        if (/```|\b(?:tsx|jsx|html|typescript)\b/i.test(content)) {
          report.technicalContentReview.push({
            id: post._id.toString(),
            slug: post.slug,
            title: post.title,
          });
        }
        report.postsChanged += 1;
        if (mode === 'apply') {
          await posts.updateOne({ _id: post._id }, { $set: update });
          const existingRevision = await revisions.findOne({
            postId: post._id,
            reason: 'migration',
          });
          if (!existingRevision && post.author instanceof Types.ObjectId) {
            await revisions.insertOne({
              postId: post._id,
              revisionNumber: 1,
              version: Number(update.version),
              reason: 'migration',
              snapshot: editable,
              contentHash: update.contentHash,
              createdBy: post.author,
              createdAt: now,
            });
            report.baselineRevisionsCreated += 1;
          } else if (!post.author) {
            report.warnings.push({
              postId: post._id.toString(),
              code: 'AUTHOR_MISSING',
              message: 'تعذر إنشاء Revision baseline لغياب الكاتب',
            });
          }
        }
      }
      if (mode === 'apply') {
        await categories.updateMany(
          { order: { $exists: false } },
          { $set: { order: 0 } },
        );
        await categories.updateMany(
          { previousSlugs: { $exists: false } },
          { $set: { previousSlugs: [] } },
        );
        await tags.updateMany(
          { order: { $exists: false } },
          { $set: { order: 0 } },
        );
        await tags.updateMany(
          { previousSlugs: { $exists: false } },
          { $set: { previousSlugs: [] } },
        );
        for (const index of await posts.indexes()) {
          const key = index.key as Record<string, unknown>;
          if (
            index.name !== '_id_' &&
            (key.publishDate ||
              key.views ||
              Object.values(key).includes('text'))
          ) {
            await posts.dropIndex(index.name!);
          }
        }
        await Promise.all([
          posts.createIndex({ slug: 1 }, { unique: true }),
          posts.createIndex({ previousSlugs: 1 }),
          posts.createIndex({ status: 1, publishedAt: -1 }),
          posts.createIndex({ status: 1, scheduledAt: 1 }),
          posts.createIndex({ category: 1, status: 1, publishedAt: -1 }),
          posts.createIndex({ tags: 1, status: 1, publishedAt: -1 }),
          posts.createIndex({
            isFeatured: 1,
            featuredOrder: 1,
            publishedAt: -1,
          }),
          posts.createIndex({ deletedAt: 1 }),
          posts.createIndex(
            { title: 'text', summary: 'text', content: 'text' },
            {
              weights: { title: 10, summary: 5, content: 1 },
              default_language: 'none',
            },
          ),
        ]);
      }
    }

    const duplicateSlugs = await posts
      .aggregate([
        { $group: { _id: '$slug', count: { $sum: 1 } } },
        { $match: { count: { $gt: 1 } } },
        { $count: 'count' },
      ])
      .toArray();
    report.verification = {
      postCountUnchanged:
        (await posts.countDocuments()) === report.before.posts,
      duplicateSlugs: duplicateSlugs[0]?.count ?? 0,
      scheduledWithoutDate: await posts.countDocuments({
        status: 'scheduled',
        scheduledAt: { $exists: false },
      }),
      publishedWithoutDate: await posts.countDocuments({
        status: 'published',
        publishedAt: { $exists: false },
      }),
      postsWithoutBaselineRevision: await posts.countDocuments({
        _id: {
          $nin: await revisions.distinct('postId', { reason: 'migration' }),
        },
      }),
    };
    return report;
  } finally {
    report.completedAt = new Date().toISOString();
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  void runBlogV2Migration(parseBlogMigrationMode(process.argv.slice(2)))
    .then((report) =>
      console.log(
        JSON.stringify(
          { report: REPORT_PATH, ...report.verification },
          null,
          2,
        ),
      ),
    )
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
