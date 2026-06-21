import { Project } from '../schemas/project.schema';
import { MediaService } from '../../media/media.service';
import { TechnologiesService } from '../../technologies/technologies.service';

export async function mapProjectToPublic(
  project: Project,
  mediaService: MediaService,
  techService: TechnologiesService,
) {
  const coverImage = await mediaService.resolveMediaUrl(project.coverImageMediaId);
  const gallery = await mediaService.resolveManyMediaUrls(project.galleryMediaIds);
  const coverImageMedia = await mediaService.resolveMediaObject(project.coverImageMediaId);
  const galleryMedia = await mediaService.resolveManyMediaObjects(project.galleryMediaIds);
  const technologies = await techService.findSummariesBySlugs(project.technologySlugs || []);
  const ogImage = await mediaService.resolveMediaUrl(project.seo?.ogImageMediaId);

  return {
    id: project._id.toString(),
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    detailedDescription: project.detailedDescription,
    coverImage,
    coverImageMedia,
    gallery,
    galleryMedia,
    technologySlugs: project.technologySlugs || [],
    technologies,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    completionDate: project.completionDate,
    status: project.status,
    category: project.category,
    order: project.order,
    featured: project.featured,
    caseStudy: project.caseStudy,
    problem: project.problem,
    solution: project.solution,
    results: project.results,
    role: project.role,
    clientName: project.clientName,
    startDate: project.startDate,
    endDate: project.endDate,
    views: project.views,
    seo: {
      metaTitle: project.seo?.metaTitle,
      metaDescription: project.seo?.metaDescription,
      ogImage,
    },
    createdAt: project.createdAt,
  };
}

export async function mapProjectToAdmin(
  project: Project,
  mediaService: MediaService,
  techService: TechnologiesService,
) {
  const coverImage = await mediaService.resolveMediaUrl(project.coverImageMediaId);
  const gallery = await mediaService.resolveManyMediaUrls(project.galleryMediaIds);
  const coverImageMedia = await mediaService.resolveMediaObject(project.coverImageMediaId);
  const galleryMedia = await mediaService.resolveManyMediaObjects(project.galleryMediaIds);
  const technologies = await techService.findSummariesBySlugs(project.technologySlugs || []);
  const ogImage = await mediaService.resolveMediaUrl(project.seo?.ogImageMediaId);
  const ogImageMedia = await mediaService.resolveMediaObject(project.seo?.ogImageMediaId);

  return {
    id: project._id.toString(),
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription,
    detailedDescription: project.detailedDescription,
    coverImageMediaId: project.coverImageMediaId?.toString(),
    coverImage,
    coverImageMedia,
    galleryMediaIds: project.galleryMediaIds?.map(id => id.toString()) || [],
    gallery,
    galleryMedia,
    technologySlugs: project.technologySlugs || [],
    technologies,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    completionDate: project.completionDate,
    status: project.status,
    category: project.category,
    order: project.order,
    isPublished: project.isPublished,
    featured: project.featured,
    isArchived: project.isArchived,
    caseStudy: project.caseStudy,
    problem: project.problem,
    solution: project.solution,
    results: project.results,
    role: project.role,
    clientName: project.clientName,
    startDate: project.startDate,
    endDate: project.endDate,
    views: project.views,
    seo: {
      metaTitle: project.seo?.metaTitle,
      metaDescription: project.seo?.metaDescription,
      ogImageMediaId: project.seo?.ogImageMediaId?.toString(),
      ogImage,
      ogImageMedia,
    },
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}
