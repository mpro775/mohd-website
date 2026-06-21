import * as fs from 'fs';
import * as path from 'path';
import mongoose, { Types } from 'mongoose';

// 1. Parse .env file
const envPath = path.resolve(__dirname, '../../../../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/(^["']|["']$)/g, '');
      process.env[key] = value;
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

// 2. Import Enums & helpers
import { ProjectCategory, ProjectStatus } from '../../../common/taxonomy/project-categories';
import { ServiceCategory } from '../../../common/taxonomy/service-categories';
import { TechnologyCategory, TechnologyGroup, ProficiencyLevel } from '../../../common/taxonomy/technology-taxonomy';
import { LinkCategory, LinkPlatform } from '../../../common/taxonomy/link-taxonomy';
import { normalizeSlug } from '../../../common/utils/slug.util';

const PROJECT_CATEGORY_LEGACY_MAP: Record<string, string> = {
  web: 'web-app',
  'web-development': 'web-app',
  mobile: 'mobile-app',
  'SaaS Platform': 'saas',
  'Artificial Intelligence': 'ai',
  'Enterprise System': 'dashboard',
  'Digital Platform': 'web-app',
  'Business Platform': 'saas',
};

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI!);
  console.log('Connected.');

  const db = mongoose.connection.db!;
  const mediaColl = db.collection('media');
  const profileColl = db.collection('profiles');
  const linksColl = db.collection('links');
  const projectsColl = db.collection('projects');
  const servicesColl = db.collection('services');
  const techColl = db.collection('technologies');
  const postsColl = db.collection('posts');

  const report: any = {
    converted: {
      profiles: 0,
      links: 0,
      projects: 0,
      services: 0,
      technologies: 0,
      posts: 0,
    },
    createdTechnologies: [],
    createdLinksFromProfile: [],
    unmatchedMediaUrls: [],
    unknownCategoriesMappedToOther: [],
    errors: [],
  };

  // Helper to extract key and lookup MediaId
  async function findMediaIdByUrl(urlStr: string): Promise<Types.ObjectId | undefined> {
    if (!urlStr || typeof urlStr !== 'string') return undefined;
    const trimmed = urlStr.trim();
    if (!trimmed) return undefined;

    // Search by URL
    let media = await mediaColl.findOne({ url: trimmed });
    if (media) return media._id as Types.ObjectId;

    // Search by Key
    // Try to extract key by removing prefix of publicUrl
    const publicUrl = process.env.R2_PUBLIC_URL || '';
    let key = trimmed;
    if (publicUrl && trimmed.startsWith(publicUrl)) {
      key = trimmed.substring(publicUrl.length).replace(/^\//, '');
    } else {
      // generic fallback extraction (grab folder + filename)
      const matches = trimmed.match(/([^/]+\/[0-9]{4}\/[0-9]{2}\/[^/]+)$/);
      if (matches) {
        key = matches[1];
      }
    }

    media = await mediaColl.findOne({ key });
    if (media) return media._id as Types.ObjectId;

    report.unmatchedMediaUrls.push(trimmed);
    return undefined;
  }

  // 3. Migrate Profiles
  console.log('Migrating Profiles...');
  const profiles = await profileColl.find({}).toArray();
  for (const profile of profiles) {
    const update: any = {};

    if (profile.profileImage && typeof profile.profileImage === 'string') {
      const mediaId = await findMediaIdByUrl(profile.profileImage);
      if (mediaId) update.profileImageMediaId = mediaId;
    }
    if (profile.cvFile && typeof profile.cvFile === 'string') {
      const mediaId = await findMediaIdByUrl(profile.cvFile);
      if (mediaId) update.cvMediaId = mediaId;
    }
    if (profile.seo?.ogImage && typeof profile.seo.ogImage === 'string') {
      const mediaId = await findMediaIdByUrl(profile.seo.ogImage);
      if (mediaId) {
        update.seo = {
          ...profile.seo,
          ogImageMediaId: mediaId,
        };
      }
    }

    // Convert social links
    if (Array.isArray(profile.socialLinks) && profile.socialLinks.length > 0) {
      for (const social of profile.socialLinks) {
        let platform = (social.platform || 'website').toLowerCase().trim();
        if (platform === 'twitter') platform = 'x';
        if (!Object.values(LinkPlatform).includes(platform as LinkPlatform)) {
          platform = 'website';
        }

        const linkUrl = social.url;
        // Check if link exists
        const exists = await linksColl.findOne({ url: linkUrl });
        if (!exists) {
          const title = social.platform ? social.platform.charAt(0).toUpperCase() + social.platform.slice(1) : 'Social Link';
          const baseSlug = normalizeSlug(`social-${social.platform || 'link'}`);
          let slug = baseSlug;
          let counter = 1;
          while (await linksColl.findOne({ slug })) {
            slug = `${baseSlug}-${counter++}`;
          }

          let iconMediaId: Types.ObjectId | undefined;
          if (social.icon) {
            iconMediaId = await findMediaIdByUrl(social.icon);
          }

          const newLink = {
            title,
            slug,
            url: linkUrl,
            description: `Converted social link for ${title}`,
            platform,
            category: LinkCategory.SOCIAL,
            openInNewTab: true,
            isFeatured: false,
            isPublished: true,
            clicks: 0,
            order: social.order || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...(iconMediaId ? { iconMediaId } : {}),
          };

          await linksColl.insertOne(newLink);
          report.createdLinksFromProfile.push({ title, url: linkUrl });
        }
      }
      update.socialLinks = []; // Empty the socialLinks array in profile
    }

    if (Object.keys(update).length > 0) {
      await profileColl.updateOne({ _id: profile._id }, { $set: update });
      report.converted.profiles++;
    }
  }

  // 4. Migrate Links
  console.log('Migrating Links...');
  const links = await linksColl.find({}).toArray();
  for (const link of links) {
    const update: any = {};
    if (link.icon && typeof link.icon === 'string') {
      const mediaId = await findMediaIdByUrl(link.icon);
      if (mediaId) update.iconMediaId = mediaId;
    }

    // Category validation
    let category = link.category;
    if (!category || !Object.values(LinkCategory).includes(category as LinkCategory)) {
      category = LinkCategory.OTHER;
      report.unknownCategoriesMappedToOther.push({ type: 'link', id: link._id.toString(), value: link.category });
    }
    update.category = category;

    // Platform validation
    let platform = link.platform;
    if (platform) {
      platform = platform.toLowerCase().trim();
      if (platform === 'twitter') platform = 'x';
      if (!Object.values(LinkPlatform).includes(platform as LinkPlatform)) {
        platform = LinkPlatform.OTHER;
      }
      update.platform = platform;
    }

    await linksColl.updateOne({ _id: link._id }, { $set: update });
    report.converted.links++;
  }

  // 5. Migrate Technologies
  console.log('Migrating Technologies...');
  const techs = await techColl.find({}).toArray();
  for (const tech of techs) {
    const update: any = {};
    if (tech.icon && typeof tech.icon === 'string') {
      const mediaId = await findMediaIdByUrl(tech.icon);
      if (mediaId) update.iconMediaId = mediaId;
    }

    // Category validation
    let category = tech.category;
    if (!category || !Object.values(TechnologyCategory).includes(category as TechnologyCategory)) {
      category = TechnologyCategory.OTHER;
      report.unknownCategoriesMappedToOther.push({ type: 'technology-category', id: tech._id.toString(), value: tech.category });
    }
    update.category = category;

    // Group validation
    let group = tech.group;
    if (!group || !Object.values(TechnologyGroup).includes(group as TechnologyGroup)) {
      group = TechnologyGroup.OTHER;
      report.unknownCategoriesMappedToOther.push({ type: 'technology-group', id: tech._id.toString(), value: tech.group });
    }
    update.group = group;

    await techColl.updateOne({ _id: tech._id }, { $set: update });
    report.converted.technologies++;
  }

  // 6. Migrate Projects
  console.log('Migrating Projects...');
  const projects = await projectsColl.find({}).toArray();
  for (const project of projects) {
    const update: any = {};

    if (project.coverImage && typeof project.coverImage === 'string') {
      const mediaId = await findMediaIdByUrl(project.coverImage);
      if (mediaId) update.coverImageMediaId = mediaId;
    }

    if (project.seo?.ogImage && typeof project.seo.ogImage === 'string') {
      const mediaId = await findMediaIdByUrl(project.seo.ogImage);
      if (mediaId) {
        update.seo = {
          ...project.seo,
          ogImageMediaId: mediaId,
        };
      }
    }

    // Merge gallery & images
    const mergedUrls = new Set<string>();
    if (Array.isArray(project.gallery)) {
      project.gallery.forEach((url: string) => mergedUrls.add(url));
    }
    if (Array.isArray(project.images)) {
      project.images.forEach((url: string) => mergedUrls.add(url));
    }

    const galleryMediaIds: Types.ObjectId[] = [];
    for (const url of mergedUrls) {
      const mediaId = await findMediaIdByUrl(url);
      if (mediaId) {
        galleryMediaIds.push(mediaId);
      }
    }
    update.galleryMediaIds = galleryMediaIds;

    // Map technologies text to technologySlugs
    const technologySlugs: string[] = [];
    if (Array.isArray(project.technologies)) {
      for (const techName of project.technologies) {
        const cleanName = techName.trim();
        if (!cleanName) continue;

        // Search by name or slug
        let techDoc: any = await techColl.findOne({
          $or: [
            { name: { $regex: new RegExp('^' + cleanName + '$', 'i') } },
            { slug: cleanName.toLowerCase() },
          ],
        });

        if (!techDoc) {
          // Create new tech
          const slug = normalizeSlug(cleanName);
          const newTech = {
            name: cleanName,
            slug,
            description: `Auto-created during migration for project ${project.title}`,
            proficiencyLevel: ProficiencyLevel.INTERMEDIATE,
            category: TechnologyCategory.OTHER,
            group: TechnologyGroup.OTHER,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const res = await techColl.insertOne(newTech);
          techDoc = { ...newTech, _id: res.insertedId };
          report.createdTechnologies.push({ name: cleanName, slug });
        }
        technologySlugs.push(techDoc.slug);
      }
    }
    update.technologySlugs = [...new Set(technologySlugs)];

    // Map category
    let legacyCat = project.category;
    let category = PROJECT_CATEGORY_LEGACY_MAP[legacyCat] || legacyCat;
    if (!Object.values(ProjectCategory).includes(category as ProjectCategory)) {
      category = ProjectCategory.OTHER;
      report.unknownCategoriesMappedToOther.push({ type: 'project', id: project._id.toString(), value: project.category });
    }
    update.category = category;

    await projectsColl.updateOne({ _id: project._id }, { $set: update });
    report.converted.projects++;
  }

  // 7. Migrate Services
  console.log('Migrating Services...');
  const services = await servicesColl.find({}).toArray();
  for (const service of services) {
    const update: any = {};
    if (service.icon && typeof service.icon === 'string') {
      const mediaId = await findMediaIdByUrl(service.icon);
      if (mediaId) update.iconMediaId = mediaId;
    }

    if (service.seo?.ogImage && typeof service.seo.ogImage === 'string') {
      const mediaId = await findMediaIdByUrl(service.seo.ogImage);
      if (mediaId) {
        update.seo = {
          ...service.seo,
          ogImageMediaId: mediaId,
        };
      }
    }

    // Map Category (Services need a valid category)
    let category = service.category;
    if (!category || !Object.values(ServiceCategory).includes(category as ServiceCategory)) {
      // Map based on slug if possible
      if (service.slug?.includes('web')) {
        category = ServiceCategory.WEB_DEVELOPMENT;
      } else if (service.slug?.includes('mobile') || service.slug?.includes('app')) {
        category = ServiceCategory.MOBILE_DEVELOPMENT;
      } else if (service.slug?.includes('api') || service.slug?.includes('backend')) {
        category = ServiceCategory.BACKEND_API;
      } else {
        category = ServiceCategory.OTHER;
        report.unknownCategoriesMappedToOther.push({ type: 'service', id: service._id.toString(), value: service.category });
      }
    }
    update.category = category;

    await servicesColl.updateOne({ _id: service._id }, { $set: update });
    report.converted.services++;
  }

  // 8. Migrate Posts
  console.log('Migrating Posts...');
  const posts = await postsColl.find({}).toArray();
  for (const post of posts) {
    const update: any = {};
    if (post.featuredImage && typeof post.featuredImage === 'string') {
      const mediaId = await findMediaIdByUrl(post.featuredImage);
      if (mediaId) update.featuredImageMediaId = mediaId;
    }
    if (post.coverImage && typeof post.coverImage === 'string') {
      const mediaId = await findMediaIdByUrl(post.coverImage);
      if (mediaId) update.coverImageMediaId = mediaId;
    }
    if (post.seo?.ogImage && typeof post.seo.ogImage === 'string') {
      const mediaId = await findMediaIdByUrl(post.seo.ogImage);
      if (mediaId) {
        update.seo = {
          ...post.seo,
          ogImageMediaId: mediaId,
        };
      }
    }

    if (Object.keys(update).length > 0) {
      await postsColl.updateOne({ _id: post._id }, { $set: update });
      report.converted.posts++;
    }
  }

  // 9. Sync Media Usage
  console.log('Syncing Media Usage...');
  // Reset all media
  await mediaColl.updateMany({}, { $set: { usedIn: [], isUsed: false } });

  const mediaUsages: Record<string, { resourceType: string; resourceId: string; field: string }[]> = {};

  function addUsage(mediaId: any, resourceType: string, resourceId: string, field: string) {
    if (!mediaId) return;
    const mIdStr = mediaId.toString();
    if (!mediaUsages[mIdStr]) mediaUsages[mIdStr] = [];
    // prevent duplicate
    const exists = mediaUsages[mIdStr].some(u => u.resourceType === resourceType && u.resourceId === resourceId && u.field === field);
    if (!exists) {
      mediaUsages[mIdStr].push({ resourceType, resourceId, field });
    }
  }

  // Gather Profile usages
  const updatedProfiles = await profileColl.find({}).toArray();
  for (const p of updatedProfiles) {
    if (p.profileImageMediaId) addUsage(p.profileImageMediaId, 'Profile', p._id.toString(), 'profileImage');
    if (p.cvMediaId) addUsage(p.cvMediaId, 'Profile', p._id.toString(), 'cvFile');
    if (p.seo?.ogImageMediaId) addUsage(p.seo.ogImageMediaId, 'Profile', p._id.toString(), 'seo.ogImage');
  }

  // Gather Link usages
  const updatedLinks = await linksColl.find({}).toArray();
  for (const l of updatedLinks) {
    if (l.iconMediaId) addUsage(l.iconMediaId, 'Link', l._id.toString(), 'icon');
  }

  // Gather Tech usages
  const updatedTechs = await techColl.find({}).toArray();
  for (const t of updatedTechs) {
    if (t.iconMediaId) addUsage(t.iconMediaId, 'Technology', t._id.toString(), 'icon');
  }

  // Gather Project usages
  const updatedProjects = await projectsColl.find({}).toArray();
  for (const pr of updatedProjects) {
    if (pr.coverImageMediaId) addUsage(pr.coverImageMediaId, 'Project', pr._id.toString(), 'coverImage');
    if (Array.isArray(pr.galleryMediaIds)) {
      pr.galleryMediaIds.forEach((id: any) => addUsage(id, 'Project', pr._id.toString(), 'gallery'));
    }
    if (pr.seo?.ogImageMediaId) addUsage(pr.seo.ogImageMediaId, 'Project', pr._id.toString(), 'seo.ogImage');
  }

  // Gather Service usages
  const updatedServices = await servicesColl.find({}).toArray();
  for (const s of updatedServices) {
    if (s.iconMediaId) addUsage(s.iconMediaId, 'Service', s._id.toString(), 'icon');
    if (s.seo?.ogImageMediaId) addUsage(s.seo.ogImageMediaId, 'Service', s._id.toString(), 'seo.ogImage');
  }

  // Gather Post usages
  const updatedPosts = await postsColl.find({}).toArray();
  const markdownImageRegex = /!\[[^\]]*]\((?<url>[^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlImageRegex = /<img\b[^>]*\bsrc=["'](?<url>[^"']+)["'][^>]*>/gi;

  for (const po of updatedPosts) {
    if (po.featuredImageMediaId) addUsage(po.featuredImageMediaId, 'Post', po._id.toString(), 'featuredImage');
    if (po.coverImageMediaId) addUsage(po.coverImageMediaId, 'Post', po._id.toString(), 'coverImage');
    if (po.seo?.ogImageMediaId) addUsage(po.seo.ogImageMediaId, 'Post', po._id.toString(), 'seo.ogImage');

    // Extract from content
    const content = po.content || '';
    const urls = new Set<string>();
    for (const match of content.matchAll(markdownImageRegex)) {
      if (match.groups?.url) urls.add(match.groups.url);
    }
    for (const match of content.matchAll(htmlImageRegex)) {
      if (match.groups?.url) urls.add(match.groups.url);
    }

    for (const url of urls) {
      const mediaId = await findMediaIdByUrl(url);
      if (mediaId) {
        addUsage(mediaId, 'Post', po._id.toString(), 'content');
      }
    }
  }

  // Write usages to Media
  console.log(`Writing usages to ${Object.keys(mediaUsages).length} media items...`);
  for (const [mIdStr, usages] of Object.entries(mediaUsages)) {
    await mediaColl.updateOne(
      { _id: new Types.ObjectId(mIdStr) },
      { $set: { usedIn: usages, isUsed: true } }
    );
  }

  console.log('Migration Completed successfully.');

  // Save report file
  const reportPath = path.resolve(__dirname, '../../../../media-migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`Report written to ${reportPath}`);

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
