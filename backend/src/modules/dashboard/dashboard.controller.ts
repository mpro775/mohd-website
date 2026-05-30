import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
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
