import { Link } from '../schemas/link.schema';
import { MediaService } from '../../media/media.service';

export async function mapLinkToPublic(link: Link, mediaService: MediaService) {
  const icon = await mediaService.resolveMediaUrl(link.iconMediaId);
  return {
    id: link._id.toString(),
    title: link.title,
    slug: link.slug,
    url: link.url,
    description: link.description,
    icon,
    platform: link.platform,
    category: link.category,
    openInNewTab: link.openInNewTab,
    isFeatured: link.isFeatured,
    clicks: link.clicks,
    order: link.order,
    createdAt: link.createdAt,
  };
}

export async function mapLinkToAdmin(link: Link, mediaService: MediaService) {
  const icon = await mediaService.resolveMediaUrl(link.iconMediaId);
  const iconMedia = await mediaService.resolveMediaObject(link.iconMediaId);
  return {
    id: link._id.toString(),
    title: link.title,
    slug: link.slug,
    url: link.url,
    description: link.description,
    iconMediaId: link.iconMediaId?.toString(),
    icon,
    iconMedia,
    platform: link.platform,
    category: link.category,
    openInNewTab: link.openInNewTab,
    isFeatured: link.isFeatured,
    isPublished: link.isPublished,
    clicks: link.clicks,
    lastClickedAt: link.lastClickedAt,
    order: link.order,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
  };
}
