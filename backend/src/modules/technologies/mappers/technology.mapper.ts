import { Technology } from '../schemas/technology.schema';
import { MediaService } from '../../media/media.service';

export async function mapTechnologyToPublic(tech: Technology, mediaService: MediaService) {
  const icon = await mediaService.resolveMediaUrl(tech.iconMediaId);
  return {
    id: tech._id.toString(),
    name: tech.name,
    slug: tech.slug,
    description: tech.description,
    icon,
    proficiencyLevel: tech.proficiencyLevel,
    category: tech.category,
    group: tech.group,
    officialUrl: tech.officialUrl,
    yearsOfExperience: tech.yearsOfExperience,
    highlighted: tech.highlighted,
    color: tech.color,
    order: tech.order,
    createdAt: tech.createdAt,
  };
}

export async function mapTechnologyToAdmin(tech: Technology, mediaService: MediaService) {
  const icon = await mediaService.resolveMediaUrl(tech.iconMediaId);
  const iconMedia = await mediaService.resolveMediaObject(tech.iconMediaId);
  return {
    id: tech._id.toString(),
    name: tech.name,
    slug: tech.slug,
    description: tech.description,
    iconMediaId: tech.iconMediaId?.toString(),
    icon,
    iconMedia,
    proficiencyLevel: tech.proficiencyLevel,
    category: tech.category,
    group: tech.group,
    officialUrl: tech.officialUrl,
    yearsOfExperience: tech.yearsOfExperience,
    highlighted: tech.highlighted,
    isPublished: tech.isPublished,
    color: tech.color,
    order: tech.order,
    createdAt: tech.createdAt,
    updatedAt: tech.updatedAt,
  };
}
