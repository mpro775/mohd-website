import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditLogsService } from './audit-logs.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    const result = await this.auditLogsService.findAll(page, limit);
    return {
      message: 'Audit logs loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }
}
