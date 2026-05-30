import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AuditLogsService } from './audit-logs.service';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(@Query() query: any) {
    const result = await this.auditLogsService.findAll(query);
    return {
      message: 'Audit logs loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const log = await this.auditLogsService.findOne(id);
    return {
      message: 'Audit log loaded successfully',
      data: log,
    };
  }
}
