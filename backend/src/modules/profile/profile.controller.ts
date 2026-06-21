import { Body, Controller, Get, Put, UseGuards, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { MediaService } from '../media/media.service';
import { mapProfileToPublic, mapProfileToAdmin } from './mappers/profile.mapper';

@Public()
@Controller('public/profile')
export class PublicProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async getProfile() {
    const raw = await this.profileService.getProfile();
    const mapped = await mapProfileToPublic(raw, this.mediaService);
    return {
      message: 'Profile loaded successfully',
      data: mapped,
    };
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/profile')
export class AdminProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly mediaService: MediaService,
  ) {}

  @Get()
  async getProfile() {
    const raw = await this.profileService.getProfile();
    const mapped = await mapProfileToAdmin(raw, this.mediaService);
    return {
      message: 'Profile loaded successfully',
      data: mapped,
    };
  }

  @Put()
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const raw = await this.profileService.updateProfile(updateProfileDto, req);
    const mapped = await mapProfileToAdmin(raw, this.mediaService);
    return {
      message: 'Profile updated successfully',
      data: mapped,
    };
  }
}
