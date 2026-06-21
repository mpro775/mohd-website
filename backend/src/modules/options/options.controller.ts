import { Controller, Get, UseGuards } from '@nestjs/common';
import { OptionsService } from './options.service';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

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

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EDITOR)
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
