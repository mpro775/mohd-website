import { Types } from 'mongoose';
import { MediaService, ResolvedMedia } from '../../media/media.service';
import { Certification } from '../schemas/certification.schema';

function idOf(value?: string | Types.ObjectId): string | undefined {
  return value?.toString();
}

function iso(value?: Date): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export type CertificationValidityStatus =
  | 'no-expiry'
  | 'active'
  | 'expired'
  | 'unknown';

export function getCertificationValidityStatus(
  certification: Certification,
  now = new Date(),
): CertificationValidityStatus {
  if (certification.doesNotExpire) return 'no-expiry';
  if (!certification.expiresAt) return 'unknown';
  return new Date(certification.expiresAt).getTime() >= now.getTime()
    ? 'active'
    : 'expired';
}

function mediaFor(
  map: Map<string, ResolvedMedia>,
  value?: Types.ObjectId,
): ResolvedMedia | undefined {
  const id = idOf(value);
  return id ? map.get(id) : undefined;
}

function publicShape(item: Certification, media: Map<string, ResolvedMedia>) {
  const image = mediaFor(media, item.imageMediaId);
  const document = mediaFor(media, item.documentMediaId);
  const issuerLogo = mediaFor(media, item.issuerLogoMediaId);
  const ogImage = mediaFor(media, item.seo?.ogImageMediaId);
  return {
    id: item._id.toString(),
    title: item.title,
    slug: item.slug,
    type: item.type,
    issuer: item.issuer,
    platform: item.platform,
    platformUrl: item.platformUrl,
    description: item.description,
    credentialId: item.credentialId,
    credentialUrl: item.credentialUrl,
    issuedAt: iso(item.issuedAt),
    expiresAt: iso(item.expiresAt),
    doesNotExpire: item.doesNotExpire,
    validityStatus: getCertificationValidityStatus(item),
    image: image?.url,
    document: document?.url,
    issuerLogo: issuerLogo?.url,
    skills: item.skills ?? [],
    category: item.category,
    language: item.language,
    durationHours: item.durationHours,
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

async function resolveMedia(list: Certification[], mediaService: MediaService) {
  return mediaService.resolveMediaObjectsByIds(
    list.flatMap((item) => [
      item.imageMediaId,
      item.documentMediaId,
      item.issuerLogoMediaId,
      item.seo?.ogImageMediaId,
    ]),
  );
}

export async function mapCertificationsToPublic(
  list: Certification[],
  mediaService: MediaService,
) {
  const media = await resolveMedia(list, mediaService);
  return list.map((item) => publicShape(item, media));
}

export async function mapCertificationToPublic(
  item: Certification,
  mediaService: MediaService,
) {
  return (await mapCertificationsToPublic([item], mediaService))[0];
}

export async function mapCertificationsToAdmin(
  list: Certification[],
  mediaService: MediaService,
) {
  const media = await resolveMedia(list, mediaService);
  return list.map((item) => {
    const imageMedia = mediaFor(media, item.imageMediaId);
    const documentMedia = mediaFor(media, item.documentMediaId);
    const issuerLogoMedia = mediaFor(media, item.issuerLogoMediaId);
    const ogImageMedia = mediaFor(media, item.seo?.ogImageMediaId);
    return {
      ...publicShape(item, media),
      imageMediaId: idOf(item.imageMediaId),
      imageMedia,
      documentMediaId: idOf(item.documentMediaId),
      documentMedia,
      issuerLogoMediaId: idOf(item.issuerLogoMediaId),
      issuerLogoMedia,
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

export async function mapCertificationToAdmin(
  item: Certification,
  mediaService: MediaService,
) {
  return (await mapCertificationsToAdmin([item], mediaService))[0];
}
