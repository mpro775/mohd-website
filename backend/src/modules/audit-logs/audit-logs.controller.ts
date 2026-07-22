import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/auth/permissions.enum';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditLogsService } from './audit-logs.service';
import { FilterAuditLogDto } from './dto/filter-audit-log.dto';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.VIEW_AUDIT_LOGS)
@Controller('admin/audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(@Query() query: FilterAuditLogDto) {
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
