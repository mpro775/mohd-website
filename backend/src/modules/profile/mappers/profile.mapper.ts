import { Profile } from '../schemas/profile.schema';
import { MediaService } from '../../media/media.service';

export async function mapProfileToPublic(
  profile: Profile,
  mediaService: MediaService,
) {
  const profileImage = await mediaService.resolveMediaUrl(
    profile.profileImageMediaId,
  );
  const cvFile = await mediaService.resolveMediaUrl(profile.cvMediaId);
  const ogImage = await mediaService.resolveMediaUrl(
    profile.seo?.ogImageMediaId,
  );

  return {
    id: profile._id.toString(),
    fullName: profile.fullName,
    title: profile.title,
    headline: profile.headline,
    bio: profile.bio,
    about: profile.about,
    profileImage,
    profileImageAlt: profile.profileImageAlt,
    cvFile,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    availableForWork: profile.availableForWork,
    languages: profile.languages || [],
    yearsOfExperience: profile.yearsOfExperience,
    seo: {
      metaTitle: profile.seo?.metaTitle,
      metaDescription: profile.seo?.metaDescription,
      ogImage,
    },
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export async function mapProfileToAdmin(
  profile: Profile,
  mediaService: MediaService,
) {
  const profileImage = await mediaService.resolveMediaUrl(
    profile.profileImageMediaId,
  );
  const cvFile = await mediaService.resolveMediaUrl(profile.cvMediaId);
  const ogImage = await mediaService.resolveMediaUrl(
    profile.seo?.ogImageMediaId,
  );

  const profileImageMedia = await mediaService.resolveMediaObject(
    profile.profileImageMediaId,
  );
  const cvMedia = await mediaService.resolveMediaObject(profile.cvMediaId);
  const ogImageMedia = await mediaService.resolveMediaObject(
    profile.seo?.ogImageMediaId,
  );

  return {
    id: profile._id.toString(),
    fullName: profile.fullName,
    title: profile.title,
    headline: profile.headline,
    bio: profile.bio,
    about: profile.about,
    profileImageMediaId: profile.profileImageMediaId?.toString(),
    profileImage,
    profileImageMedia,
    profileImageAlt: profile.profileImageAlt,
    cvMediaId: profile.cvMediaId?.toString(),
    cvFile,
    cvMedia,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    availableForWork: profile.availableForWork,
    languages: profile.languages || [],
    yearsOfExperience: profile.yearsOfExperience,
    seo: {
      metaTitle: profile.seo?.metaTitle,
      metaDescription: profile.seo?.metaDescription,
      ogImageMediaId: profile.seo?.ogImageMediaId?.toString(),
      ogImage,
      ogImageMedia,
    },
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}
