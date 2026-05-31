import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from '../projects/schemas/project.schema';
import { Post, PostStatus } from '../blog/posts/schemas/post.schema';
import { Service } from '../services/schemas/service.schema';

type UrlEntry = {
  loc: string;
  lastmod?: Date;
  changefreq?: string;
  priority?: string;
};

@Injectable()
export class SeoService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Service.name) private serviceModel: Model<Service>,
  ) {}

  async generateSitemap(): Promise<string> {
    const entries = await this.getUrlEntries();
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
      .map(
        (entry) =>
          `  <url><loc>${entry.loc}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod.toISOString()}</lastmod>` : ''}<changefreq>${entry.changefreq ?? 'weekly'}</changefreq><priority>${entry.priority ?? '0.7'}</priority></url>`,
      )
      .join('\n')}\n</urlset>`;
  }

  generateRobots(): string {
    const baseUrl = this.baseUrl();
    return [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/admin/',
      'Disallow: /api/auth/',
      `Sitemap: ${baseUrl}/sitemap.xml`,
      '',
    ].join('\n');
  }

  async generateRss(): Promise<string> {
    const baseUrl = this.baseUrl();
    const posts = await this.postModel
      .find({
        status: PostStatus.PUBLISHED,
        publishDate: { $lte: new Date() },
        allowIndexing: { $ne: false },
      })
      .sort({ publishDate: -1 })
      .limit(20)
      .exec();

    return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Mohd Blog</title><link>${baseUrl}</link><description>Latest posts</description>${posts
      .map(
        (post) =>
          `<item><title>${this.escapeXml(post.title)}</title><link>${baseUrl}/blog/${post.slug}</link><guid>${baseUrl}/blog/${post.slug}</guid><pubDate>${(post.publishDate ?? post.createdAt).toUTCString()}</pubDate><description>${this.escapeXml(post.summary ?? post.excerpt ?? '')}</description></item>`,
      )
      .join('')}</channel></rss>`;
  }

  private async getUrlEntries(): Promise<UrlEntry[]> {
    const baseUrl = this.baseUrl();
    const [projects, posts, services] = await Promise.all([
      this.projectModel
        .find({ isPublished: true, isArchived: { $ne: true } })
        .select('slug updatedAt')
        .exec(),
      this.postModel
        .find({
          status: PostStatus.PUBLISHED,
          publishDate: { $lte: new Date() },
          allowIndexing: { $ne: false },
        })
        .select('slug updatedAt')
        .exec(),
      this.serviceModel
        .find({ isPublished: true })
        .select('slug updatedAt')
        .exec(),
    ]);

    return [
      { loc: baseUrl, changefreq: 'weekly', priority: '1.0' },
      { loc: `${baseUrl}/projects`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${baseUrl}/blog`, changefreq: 'daily', priority: '0.8' },
      { loc: `${baseUrl}/services`, changefreq: 'weekly', priority: '0.8' },
      ...projects.map((project) => ({
        loc: `${baseUrl}/projects/${project.slug}`,
        lastmod: project.updatedAt,
      })),
      ...posts.map((post) => ({
        loc: `${baseUrl}/blog/${post.slug}`,
        lastmod: post.updatedAt,
      })),
      ...services.map((service) => ({
        loc: `${baseUrl}/services/${service.slug}`,
        lastmod: service.updatedAt,
      })),
    ];
  }

  private baseUrl(): string {
    return (
      this.configService.get<string>('app.siteUrl') ||
      process.env.SITE_URL ||
      'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  private escapeXml(value: string): string {
    return value.replace(/[<>&'"]/g, (char) => {
      const map: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;',
      };
      return map[char];
    });
  }
}
