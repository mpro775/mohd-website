import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from './schemas/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MediaService } from '../media/media.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
    private readonly mediaService: MediaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  private async syncMedia(profile: Profile): Promise<void> {
    const imageUrls = profile.profileImage ? [profile.profileImage] : [];
    const cvUrls = profile.cvFile ? [profile.cvFile] : [];
    const socialIcons =
      profile.socialLinks
        ?.map((item) => item.icon)
        .filter((icon): icon is string => Boolean(icon)) ?? [];
    const ogImages = profile.seo?.ogImage ? [profile.seo.ogImage] : [];

    await this.mediaService.syncUsage(
      imageUrls,
      'Profile',
      profile._id.toString(),
      'profileImage',
    );
    await this.mediaService.syncUsage(
      imageUrls,
      'Profile',
      profile._id.toString(),
      'avatar',
    );
    await this.mediaService.syncUsage(
      cvUrls,
      'Profile',
      profile._id.toString(),
      'cvFile',
    );
    await this.mediaService.syncUsage(
      socialIcons,
      'Profile',
      profile._id.toString(),
      'socialLinks.icon',
    );
    await this.mediaService.syncUsage(
      ogImages,
      'Profile',
      profile._id.toString(),
      'seo.ogImage',
    );
  }

  async getProfile(): Promise<Profile> {
    const profile = await this.profileModel.findOne();

    if (!profile) {
      throw new NotFoundException('الملف الشخصي غير موجود');
    }

    return profile;
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    req?: any,
  ): Promise<Profile> {
    let profile = await this.profileModel.findOne();
    const before = profile ? profile.toObject() : null;

    if (!profile) {
      profile = new this.profileModel(updateProfileDto);
      await profile.save();
    } else {
      Object.assign(profile, updateProfileDto);
      await profile.save();
    }

    await this.syncMedia(profile);

    // Audit Log
    await this.auditLogsService.log({
      action: 'profile.updated',
      resource: 'Profile',
      resourceId: profile._id.toString(),
      before,
      after: profile.toObject(),
      request: req,
    });

    return profile;
  }

  async createInitialProfile(data: Partial<Profile>): Promise<Profile> {
    const existingProfile = await this.profileModel.findOne();

    if (existingProfile) {
      return existingProfile;
    }

    const profile = new this.profileModel(data);
    await profile.save();

    await this.syncMedia(profile);

    return profile;
  }
}
