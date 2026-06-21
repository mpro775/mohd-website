import { Service } from '../schemas/service.schema';
import { MediaService } from '../../media/media.service';

export async function mapServiceToPublic(service: Service, mediaService: MediaService) {
  const icon = await mediaService.resolveMediaUrl(service.iconMediaId);
  const ogImage = await mediaService.resolveMediaUrl(service.seo?.ogImageMediaId);
  return {
    id: service._id.toString(),
    name: service.name,
    slug: service.slug,
    shortDescription: service.shortDescription,
    detailedDescription: service.detailedDescription,
    icon,
    startingPrice: service.startingPrice,
    currency: service.currency,
    price: service.price,
    duration: service.duration,
    deliverables: service.deliverables || [],
    requirements: service.requirements || [],
    ctaText: service.ctaText,
    ctaUrl: service.ctaUrl,
    isFeatured: service.isFeatured,
    category: service.category,
    order: service.order,
    seo: {
      metaTitle: service.seo?.metaTitle,
      metaDescription: service.seo?.metaDescription,
      ogImage,
    },
    createdAt: service.createdAt,
  };
}

export async function mapServiceToAdmin(service: Service, mediaService: MediaService) {
  const icon = await mediaService.resolveMediaUrl(service.iconMediaId);
  const iconMedia = await mediaService.resolveMediaObject(service.iconMediaId);
  const ogImage = await mediaService.resolveMediaUrl(service.seo?.ogImageMediaId);
  const ogImageMedia = await mediaService.resolveMediaObject(service.seo?.ogImageMediaId);
  return {
    id: service._id.toString(),
    name: service.name,
    slug: service.slug,
    shortDescription: service.shortDescription,
    detailedDescription: service.detailedDescription,
    iconMediaId: service.iconMediaId?.toString(),
    icon,
    iconMedia,
    startingPrice: service.startingPrice,
    currency: service.currency,
    price: service.price,
    duration: service.duration,
    deliverables: service.deliverables || [],
    requirements: service.requirements || [],
    ctaText: service.ctaText,
    ctaUrl: service.ctaUrl,
    isFeatured: service.isFeatured,
    isPublished: service.isPublished,
    category: service.category,
    order: service.order,
    seo: {
      metaTitle: service.seo?.metaTitle,
      metaDescription: service.seo?.metaDescription,
      ogImageMediaId: service.seo?.ogImageMediaId?.toString(),
      ogImage,
      ogImageMedia,
    },
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
  };
}
