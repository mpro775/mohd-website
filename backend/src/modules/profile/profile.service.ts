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
    const profileImageId = profile.profileImageMediaId ? [profile.profileImageMediaId.toString()] : [];
    const cvId = profile.cvMediaId ? [profile.cvMediaId.toString()] : [];
    const ogImageId = profile.seo?.ogImageMediaId ? [profile.seo.ogImageMediaId.toString()] : [];

    await this.mediaService.syncUsageByIds(
      profileImageId,
      'Profile',
      profile._id.toString(),
      'profileImage',
    );
    await this.mediaService.syncUsageByIds(
      cvId,
      'Profile',
      profile._id.toString(),
      'cvFile',
    );
    await this.mediaService.syncUsageByIds(
      ogImageId,
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
    // Assert media existence and correct types if provided
    if (updateProfileDto.profileImageMediaId) {
      await this.mediaService.assertMediaExists(updateProfileDto.profileImageMediaId, { type: 'image' });
    }
    if (updateProfileDto.cvMediaId) {
      await this.mediaService.assertMediaExists(updateProfileDto.cvMediaId, { type: 'document' });
    }
    if (updateProfileDto.seo?.ogImageMediaId) {
      await this.mediaService.assertMediaExists(updateProfileDto.seo.ogImageMediaId, { type: 'image' });
    }

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

    if (data.profileImageMediaId) {
      await this.mediaService.assertMediaExists(data.profileImageMediaId.toString(), { type: 'image' });
    }
    if (data.cvMediaId) {
      await this.mediaService.assertMediaExists(data.cvMediaId.toString(), { type: 'document' });
    }
    if (data.seo?.ogImageMediaId) {
      await this.mediaService.assertMediaExists(data.seo.ogImageMediaId.toString(), { type: 'image' });
    }

    const profile = new this.profileModel(data);
    await profile.save();

    await this.syncMedia(profile);

    return profile;
  }
}
