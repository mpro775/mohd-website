import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../common/auth/permissions.enum';
import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FilterContactMessageDto } from './dto/filter-contact-message.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ParseObjectIdPipe } from '../../common/pipes/parse-object-id.pipe';

@Public()
@Controller('public/contact')
export class PublicContactController {
  constructor(private readonly contactService: ContactService) {}

  @Throttle({ default: { ttl: 3600000, limit: 3 } })
  @Post()
  async create(
    @Req() req: any,
    @Body() createMessageDto: CreateMessageDto,
    @Ip() ip: string,
  ) {
    await this.contactService.create(createMessageDto, ip, req);
    return {
      message: 'Message received successfully',
      data: null,
    };
  }
}

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(Permission.MANAGE_CONTACT_MESSAGES)
@Controller('admin/contact/messages')
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  async findAll(@Query() query: FilterContactMessageDto) {
    const result = await this.contactService.findAll(query);
    return {
      message: 'Messages loaded successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return {
      message: 'Message loaded successfully',
      data: await this.contactService.findOne(id),
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return {
      message: 'Message status updated successfully',
      data: await this.contactService.updateStatus(
        id,
        updateStatusDto.status,
        updateStatusDto.notes,
        req,
      ),
    };
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id', ParseObjectIdPipe) id: string) {
    await this.contactService.remove(id, req);
    return { message: 'Message deleted successfully', data: null };
  }
}
