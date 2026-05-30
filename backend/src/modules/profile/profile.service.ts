import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile } from './schemas/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Profile.name) private profileModel: Model<Profile>,
  ) {}

  async getProfile(): Promise<Profile> {
    const profile = await this.profileModel.findOne();

    if (!profile) {
      throw new NotFoundException('الملف الشخصي غير موجود');
    }

    return profile;
  }

  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<Profile> {
    // Check if profile exists
    let profile = await this.profileModel.findOne();

    if (!profile) {
      // Create new profile if doesn't exist
      profile = new this.profileModel(updateProfileDto);
      return profile.save();
    }

    // Update existing profile
    Object.assign(profile, updateProfileDto);
    return profile.save();
  }

  async createInitialProfile(data: Partial<Profile>): Promise<Profile> {
    const existingProfile = await this.profileModel.findOne();

    if (existingProfile) {
      return existingProfile;
    }

    const profile = new this.profileModel(data);
    return profile.save();
  }
}
