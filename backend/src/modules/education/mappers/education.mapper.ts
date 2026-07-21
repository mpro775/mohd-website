import { Types } from 'mongoose';
import { MediaService, ResolvedMedia } from '../../media/media.service';
import { Education } from '../schemas/education.schema';

function idOf(value?: string | Types.ObjectId): string | undefined {
  return value?.toString();
}

function iso(value?: Date): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function mediaFor(
  map: Map<string, ResolvedMedia>,
  value?: Types.ObjectId,
): ResolvedMedia | undefined {
  const id = idOf(value);
  return id ? map.get(id) : undefined;
}

function publicShape(item: Education, media: Map<string, ResolvedMedia>) {
  const institutionLogo = mediaFor(media, item.institutionLogoMediaId);
  const coverImage = mediaFor(media, item.coverImageMediaId);
  const certificate = mediaFor(media, item.certificateMediaId);
  const ogImage = mediaFor(media, item.seo?.ogImageMediaId);
  return {
    id: item._id.toString(),
    institution: item.institution,
    slug: item.slug,
    degree: item.degree,
    degreeType: item.degreeType,
    fieldOfStudy: item.fieldOfStudy,
    startDate: iso(item.startDate),
    endDate: iso(item.endDate),
    isCurrent: item.isCurrent,
    grade: item.grade,
    description: item.description,
    location: item.location,
    institutionUrl: item.institutionUrl,
    institutionLogo: institutionLogo?.url,
    coverImage: coverImage?.url,
    certificate: certificate?.url,
    achievements: item.achievements ?? [],
    isFeatured: item.isFeatured,
    order: item.order,
    seo: {
      metaTitle: item.seo?.metaTitle,
      metaDescription: item.seo?.metaDescription,
      ogImage: ogImage?.url,
    },
    createdAt: iso(item.createdAt),
    updatedAt: iso(item.updatedAt),
  };
}

async function resolveMedia(list: Education[], mediaService: MediaService) {
  return mediaService.resolveMediaObjectsByIds(
    list.flatMap((item) => [
      item.institutionLogoMediaId,
      item.coverImageMediaId,
      item.certificateMediaId,
      item.seo?.ogImageMediaId,
    ]),
  );
}

export async function mapEducationListToPublic(
  list: Education[],
  mediaService: MediaService,
) {
  const media = await resolveMedia(list, mediaService);
  return list.map((item) => publicShape(item, media));
}

export async function mapEducationToPublic(
  item: Education,
  mediaService: MediaService,
) {
  return (await mapEducationListToPublic([item], mediaService))[0];
}

export async function mapEducationListToAdmin(
  list: Education[],
  mediaService: MediaService,
) {
  const media = await resolveMedia(list, mediaService);
  return list.map((item) => {
    const institutionLogoMedia = mediaFor(media, item.institutionLogoMediaId);
    const coverImageMedia = mediaFor(media, item.coverImageMediaId);
    const certificateMedia = mediaFor(media, item.certificateMediaId);
    const ogImageMedia = mediaFor(media, item.seo?.ogImageMediaId);
    return {
      ...publicShape(item, media),
      institutionLogoMediaId: idOf(item.institutionLogoMediaId),
      institutionLogoMedia,
      coverImageMediaId: idOf(item.coverImageMediaId),
      coverImageMedia,
      certificateMediaId: idOf(item.certificateMediaId),
      certificateMedia,
      isPublished: item.isPublished,
      seo: {
        metaTitle: item.seo?.metaTitle,
        metaDescription: item.seo?.metaDescription,
        ogImage: ogImageMedia?.url,
        ogImageMediaId: idOf(item.seo?.ogImageMediaId),
        ogImageMedia,
      },
    };
  });
}

export async function mapEducationToAdmin(
  item: Education,
  mediaService: MediaService,
) {
  return (await mapEducationListToAdmin([item], mediaService))[0];
}
