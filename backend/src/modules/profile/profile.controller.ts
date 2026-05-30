import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Public()
@Controller(['public/profile', 'profile'])
export class PublicProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile() {
    return {
      message: 'Profile loaded successfully',
      data: await this.profileService.getProfile(),
    };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('admin/profile')
export class AdminProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile() {
    return {
      message: 'Profile loaded successfully',
      data: await this.profileService.getProfile(),
    };
  }

  @Put()
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
    return {
      message: 'Profile updated successfully',
      data: await this.profileService.updateProfile(updateProfileDto),
    };
  }
}
