import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/auth/permissions.enum';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { OptionsService } from './options.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Public()
@Controller('public/options')
export class PublicOptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get()
  getOptions() {
    return {
      message: 'Options loaded successfully',
      data: this.optionsService.getOptions(),
    };
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.MANAGE_SETTINGS)
@Controller('admin/options')
export class AdminOptionsController {
  constructor(private readonly optionsService: OptionsService) {}

  @Get()
  getOptions() {
    return {
      message: 'Options loaded successfully',
      data: this.optionsService.getOptions(),
    };
  }
}
