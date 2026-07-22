import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/auth/permissions.enum';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.MANAGE_SETTINGS)
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard() {
    return {
      message: 'Dashboard stats loaded successfully',
      data: await this.dashboardService.getStats(),
    };
  }

  @Get('stats')
  async getStats() {
    return {
      message: 'Dashboard stats loaded successfully',
      data: await this.dashboardService.getStats(),
    };
  }
}
